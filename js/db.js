// js/db.js
const StudentDB = {
    async uploadPhoto(file, citizenId) {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${citizenId}_${Date.now()}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
            .from(SUPABASE_CONFIG.STORAGE_BUCKET)
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabaseClient.storage
            .from(SUPABASE_CONFIG.STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    async getAllStudents() {
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async createStudent(studentData) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const yearShort = studentData.academic_year.slice(-2);
        studentData.application_code = `NRTC${yearShort}-${randomNum}`;

        const { data, error } = await supabaseClient
            .from('students')
            .insert([studentData])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new Error('เลขประจำตัวประชาชนนี้ได้ลงทะเบียนในระบบแล้ว');
            }
            throw error;
        }
        return data;
    },

    async updateStudent(id, updateData) {
        const { data, error } = await supabaseClient
            .from('students')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteStudent(id) {
        const { error } = await supabaseClient
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
