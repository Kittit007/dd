-- =========================================================================
-- 1. สร้างตารางแผนกวิชาและสาขาที่เปิดรับ (departments)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    education_level VARCHAR(50) NOT NULL,
    faculty_type VARCHAR(100) NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.departments (education_level, faculty_type, department_name) VALUES
('ปวช.', 'อุตสาหกรรม', 'ช่างยนต์'),
('ปวช.', 'อุตสาหกรรม', 'ช่างกลโรงงาน'),
('ปวช.', 'อุตสาหกรรม', 'ช่างเชื่อมโลหะ'),
('ปวช.', 'อุตสาหกรรม', 'ช่างไฟฟ้ากำลัง'),
('ปวช.', 'อุตสาหกรรม', 'ช่างอิเล็กทรอนิกส์'),
('ปวช.', 'อุตสาหกรรม', 'ช่างก่อสร้าง'),
('ปวช.', 'พาณิชยกรรม / บริหารธุรกิจ', 'การบัญชี'),
('ปวช.', 'พาณิชยกรรม / บริหารธุรกิจ', 'การตลาด'),
('ปวช.', 'เทคโนโลยีสารสนเทศและการสื่อสาร', 'เทคโนโลยีสารสนเทศ'),
('ปวส.', 'อุตสาหกรรม', 'เทคนิคเครื่องกล'),
('ปวส.', 'อุตสาหกรรม', 'ไฟฟ้า'),
('ปวส.', 'บริหารธุรกิจ', 'การบัญชี'),
('ปวส.', 'เทคโนโลยีสารสนเทศและการสื่อสาร', 'เทคโนโลยีสารสนเทศ'),
('ปริญญาตรี (ทล.บ.)', 'อุตสาหกรรม', 'เทคโนโลยีไฟฟ้า');

-- =========================================================================
-- 2. สร้างตารางข้อมูลผู้สมัครลงทะเบียน (students)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_code VARCHAR(20) UNIQUE NOT NULL,
    academic_year VARCHAR(10) NOT NULL DEFAULT '2569',
    prefix VARCHAR(20) NOT NULL,
    first_name_th VARCHAR(100) NOT NULL,
    last_name_th VARCHAR(100) NOT NULL,
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    citizen_id VARCHAR(13) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    nationality VARCHAR(50) DEFAULT 'ไทย',
    religion VARCHAR(50) DEFAULT 'พุทธ',
    blood_group VARCHAR(10),
    photo_url TEXT,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(150),
    address_detail TEXT NOT NULL,
    subdistrict VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    previous_school VARCHAR(200) NOT NULL,
    previous_gpax NUMERIC(3, 2),
    education_level VARCHAR(50) NOT NULL,
    faculty_type VARCHAR(100) NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    study_program VARCHAR(50) DEFAULT 'ภาคปกติ',
    guardian_name VARCHAR(150) NOT NULL,
    guardian_relation VARCHAR(50) NOT NULL,
    guardian_phone VARCHAR(15) NOT NULL,
    guardian_occupation VARCHAR(100),
    status VARCHAR(30) DEFAULT 'รอตรวจสอบ'
        CHECK (status IN ('รอตรวจสอบ', 'อนุมัติการสมัคร', 'รอเอกสารเพิ่มเติม', 'ไม่ผ่านเกณฑ์')),
    admin_remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_citizen_id ON public.students(citizen_id);
CREATE INDEX IF NOT EXISTS idx_students_app_code ON public.students(application_code);
CREATE INDEX IF NOT EXISTS idx_students_department ON public.students(education_level, department_name);

-- =========================================================================
-- 3. สร้างฟังก์ชันอัปเดตเวลาแก้ไขล่าสุด (updated_at) อัตโนมัติ
-- =========================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_students_modtime ON public.students;
CREATE TRIGGER trigger_update_students_modtime
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 4. ตั้งค่าความปลอดภัย Row Level Security (RLS)
-- =========================================================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read departments" ON public.departments;
CREATE POLICY "Allow public read departments"
ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read students" ON public.students;
CREATE POLICY "Allow public read students"
ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert students" ON public.students;
CREATE POLICY "Allow public insert students"
ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update students" ON public.students;
CREATE POLICY "Allow public update students"
ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete students" ON public.students;
CREATE POLICY "Allow public delete students"
ON public.students FOR DELETE USING (true);

-- =========================================================================
-- 5. สร้าง Storage Bucket สำหรับเก็บรูปถ่ายผู้สมัครและเอกสารแนบ
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access student-documents" ON storage.objects;
CREATE POLICY "Public Access student-documents"
ON storage.objects FOR SELECT USING (bucket_id = 'student-documents');

DROP POLICY IF EXISTS "Public Upload student-documents" ON storage.objects;
CREATE POLICY "Public Upload student-documents"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-documents');
