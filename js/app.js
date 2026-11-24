// js/app.js
let allStudents = [];
let currentViewingStudent = null;
let selectedPhotoFile = null;

document.addEventListener('DOMContentLoaded', () => {
    setupPhotoPreview();
    setupFormSubmit();
    loadStudentsData();
});

function switchTab(tab) {
    const regSec = document.getElementById('registerSection');
    const dashSec = document.getElementById('dashboardSection');
    const btnReg = document.getElementById('tabRegisterBtn');
    const btnDash = document.getElementById('tabDashboardBtn');

    if (tab === 'register') {
        regSec.classList.remove('hidden');
        dashSec.classList.add('hidden');
        btnReg.classList.add('active');
        btnDash.classList.remove('active');
    } else {
        regSec.classList.add('hidden');
        dashSec.classList.remove('hidden');
        btnReg.classList.remove('active');
        btnDash.classList.add('active');
        loadStudentsData();
    }
}

function setupPhotoPreview() {
    const input = document.getElementById('photoInput');
    const preview = document.getElementById('photoPreview');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB');
            input.value = '';
            return;
        }
        selectedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => { preview.src = ev.target.result; };
        reader.readAsDataURL(file);
    });
}

function onLevelChange() {
    const level = document.getElementById('educationLevel').value;
    const facultySelect = document.getElementById('facultyType');
    const deptSelect = document.getElementById('departmentName');

    facultySelect.innerHTML = '<option value="">-- เลือกประเภทวิชา --</option>';
    deptSelect.innerHTML = '<option value="">-- เลือกสาขาวิชา --</option>';
    deptSelect.disabled = true;

    if (!level || !COLLEGE_CURRICULUM[level]) {
        facultySelect.disabled = true;
        return;
    }

    Object.keys(COLLEGE_CURRICULUM[level]).forEach(faculty => {
        const opt = document.createElement('option');
        opt.value = faculty;
        opt.textContent = faculty;
        facultySelect.appendChild(opt);
    });
    facultySelect.disabled = false;
}

function onFacultyChange() {
    const level = document.getElementById('educationLevel').value;
    const faculty = document.getElementById('facultyType').value;
    const deptSelect = document.getElementById('departmentName');

    deptSelect.innerHTML = '<option value="">-- เลือกสาขาวิชา --</option>';

    if (!faculty || !COLLEGE_CURRICULUM[level]?.[faculty]) {
        deptSelect.disabled = true;
        return;
    }

    COLLEGE_CURRICULUM[level][faculty].forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept;
        opt.textContent = dept;
        deptSelect.appendChild(opt);
    });
    deptSelect.disabled = false;
}

function setupFormSubmit() {
    const form = document.getElementById('registrationForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'กำลังบันทึกข้อมูล...';

        try {
            const citizenId = document.getElementById('citizenId').value.trim();
            let photoUrl = null;

            if (selectedPhotoFile) {
                photoUrl = await StudentDB.uploadPhoto(selectedPhotoFile, citizenId);
            }

            const payload = {
                academic_year: document.getElementById('academicYear').value,
                prefix: document.getElementById('prefix').value,
                first_name_th: document.getElementById('firstNameTh').value.trim(),
                last_name_th: document.getElementById('lastNameTh').value.trim(),
                first_name_en: document.getElementById('firstNameEn').value.trim(),
                last_name_en: document.getElementById('lastNameEn').value.trim(),
                citizen_id: citizenId,
                birth_date: document.getElementById('birthDate').value,
                gender: document.getElementById('gender').value,
                nationality: document.getElementById('nationality').value.trim(),
                religion: document.getElementById('religion').value,
                blood_group: document.getElementById('bloodGroup').value,
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                address_detail: document.getElementById('addressDetail').value.trim(),
                subdistrict: document.getElementById('subdistrict').value.trim(),
                district: document.getElementById('district').value.trim(),
                province: document.getElementById('province').value.trim(),
                postal_code: document.getElementById('postalCode').value.trim(),
                previous_school: document.getElementById('previousSchool').value.trim(),
                previous_gpax: document.getElementById('previousGpax').value || null,
                education_level: document.getElementById('educationLevel').value,
                faculty_type: document.getElementById('facultyType').value,
                department_name: document.getElementById('departmentName').value,
                study_program: document.getElementById('studyProgram').value,
                guardian_name: document.getElementById('guardianName').value.trim(),
                guardian_relation: document.getElementById('guardianRelation').value,
                guardian_phone: document.getElementById('guardianPhone').value.trim(),
                guardian_occupation: document.getElementById('guardianOccupation').value.trim()
            };

            if (photoUrl) payload.photo_url = photoUrl;

            const editId = document.getElementById('editStudentId').value;
            let savedRecord;

            if (editId) {
                savedRecord = await StudentDB.updateStudent(editId, payload);
                alert('อัปเดตข้อมูลผู้สมัครเรียบร้อยแล้ว');
            } else {
                savedRecord = await StudentDB.createStudent(payload);
                alert(`ลงทะเบียนสำเร็จ! รหัสใบสมัครของคุณคือ ${savedRecord.application_code}`);
            }

            resetForm();
            switchTab('dashboard');
            viewStudentDetail(savedRecord.id);

        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'บันทึกข้อมูลลงทะเบียน';
        }
    });
}

function resetForm() {
    document.getElementById('registrationForm').reset();
    document.getElementById('editStudentId').value = '';
    selectedPhotoFile = null;
    document.getElementById('photoPreview').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    document.getElementById('facultyType').disabled = true;
    document.getElementById('departmentName').disabled = true;
}

async function loadStudentsData() {
    try {
        allStudents = await StudentDB.getAllStudents();
        updateStats();
        renderTable();
    } catch (err) {
        document.getElementById('studentTableBody').innerHTML =
            `<tr><td colspan="7" style="text-align:center; color:#DC2626;">ไม่สามารถโหลดข้อมูลได้ (${err.message})</td></tr>`;
    }
}

function updateStats() {
    document.getElementById('statTotal').textContent = allStudents.length;
    document.getElementById('statVocCert').textContent = allStudents.filter(s => s.education_level === 'ปวช.').length;
    document.getElementById('statHighVoc').textContent = allStudents.filter(s => s.education_level === 'ปวส.').length;
    document.getElementById('statBachelor').textContent = allStudents.filter(s => s.education_level === 'ปริญญาตรี (ทล.บ.)').length;
}

function getStatusBadge(status) {
    const map = {
        'รอตรวจสอบ': 'badge-wait',
        'อนุมัติการสมัคร': 'badge-pass',
        'รอเอกสารเพิ่มเติม': 'badge-doc',
        'ไม่ผ่านเกณฑ์': 'badge-fail'
    };
    return `<span class="badge ${map[status] || 'badge-wait'}">${status}</span>`;
}

function renderTable() {
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    const levelFilter = document.getElementById('filterLevel').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const tbody = document.getElementById('studentTableBody');

    const filtered = allStudents.filter(s => {
        const matchKeyword = !keyword ||
            `${s.first_name_th} ${s.last_name_th}`.toLowerCase().includes(keyword) ||
            (s.application_code || '').toLowerCase().includes(keyword) ||
            (s.citizen_id || '').includes(keyword);
        const matchLevel = !levelFilter || s.education_level === levelFilter;
        const matchStatus = !statusFilter || s.status === statusFilter;
        return matchKeyword && matchLevel && matchStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748B;">ไม่พบข้อมูลผู้สมัคร</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(s => `
        <tr>
            <td><strong>${s.application_code}</strong></td>
            <td>${s.prefix}${s.first_name_th} ${s.last_name_th}</td>
            <td>${s.education_level}</td>
            <td>${s.department_name} (${s.study_program})</td>
            <td>${s.phone}</td>
            <td>${getStatusBadge(s.status)}</td>
            <td>
                <button type="button" class="btn btn-info" onclick="viewStudentDetail('${s.id}')">ใบสมัคร</button>
                <button type="button" class="btn btn-danger" onclick="deleteStudentRecord('${s.id}', '${s.first_name_th}')">ลบ</button>
            </td>
        </tr>
    `).join('');
}

function viewStudentDetail(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;
    currentViewingStudent = student;

    document.getElementById('modalStatusSelect').value = student.status;
    const photoHtml = student.photo_url
        ? `<img src="${student.photo_url}" style="width:95px; height:115px; object-fit:cover; border:1px solid #CBD5E1; border-radius:6px;">`
        : `<div style="width:95px; height:115px; border:1px dashed #CBD5E1; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:#94A3B8;">ไม่มีรูปถ่าย</div>`;

    document.getElementById('modalBodyContent').innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1rem;">
            <div>
                <p style="margin:0 0 6px;"><strong>รหัสใบสมัคร:</strong> <span style="color:#0B5D3B; font-size:1.1rem; font-weight:700;">${student.application_code}</span></p>
                <p style="margin:0 0 6px;"><strong>ปีการศึกษา:</strong> ${student.academic_year} | <strong>สถานะ:</strong> ${student.status}</p>
                <p style="margin:0 0 6px;"><strong>ชื่อ-นามสกุล:</strong> ${student.prefix}${student.first_name_th} ${student.last_name_th}</p>
                <p style="margin:0 0 6px;"><strong>เลขบัตรประชาชน:</strong> ${student.citizen_id}</p>
                <p style="margin:0;"><strong>วันเกิด:</strong> ${student.birth_date} | <strong>เพศ:</strong> ${student.gender} | <strong>หมู่เลือด:</strong> ${student.blood_group || '-'}</p>
            </div>
            ${photoHtml}
        </div>
        <hr style="border:none; border-top:1px solid #E2E8F0; margin:0.75rem 0;">
        <p style="margin:0 0 6px;"><strong>หลักสูตรที่สมัคร:</strong> ระดับ ${student.education_level} สาขาวิชา${student.department_name} (${student.study_program})</p>
        <p style="margin:0 0 6px;"><strong>สถานศึกษาเดิม:</strong> ${student.previous_school} (GPAX: ${student.previous_gpax || '-'})</p>
        <p style="margin:0 0 6px;"><strong>ที่อยู่:</strong> ${student.address_detail} ต.${student.subdistrict} อ.${student.district} จ.${student.province} ${student.postal_code}</p>
        <p style="margin:0 0 6px;"><strong>เบอร์โทรศัพท์ผู้สมัคร:</strong> ${student.phone} | <strong>อีเมล:</strong> ${student.email || '-'}</p>
        <p style="margin:0;"><strong>ผู้ปกครอง:</strong> ${student.guardian_name} (${student.guardian_relation}) โทร. ${student.guardian_phone}</p>
    `;

    document.getElementById('detailModal').classList.add('show');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('show');
    currentViewingStudent = null;
}

async function saveStatusChange() {
    if (!currentViewingStudent) return;
    const newStatus = document.getElementById('modalStatusSelect').value;
    try {
        await StudentDB.updateStudent(currentViewingStudent.id, { status: newStatus });
        alert('อัปเดตสถานะเรียบร้อยแล้ว');
        closeModal();
        loadStudentsData();
    } catch (err) {
        alert('อัปเดตไม่สำเร็จ: ' + err.message);
    }
}

async function deleteStudentRecord(id, name) {
    if (!confirm(`ยืนยันการลบข้อมูลการสมัครของ "${name}" ใช่หรือไม่?`)) return;
    try {
        await StudentDB.deleteStudent(id);
        loadStudentsData();
    } catch (err) {
        alert('ลบข้อมูลไม่สำเร็จ: ' + err.message);
    }
}
