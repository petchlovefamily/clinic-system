import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- Import Middleware (ด่านตรวจ) ---
import { isAuthenticated, hasRole } from './middleware/auth.js';

const app = express();
const port = 5000;

// สร้าง instance ของ Prisma Client
export const prisma = new PrismaClient();

// Middleware พื้นฐาน
app.use(cors());
app.use(express.json());

// API Endpoint ทดสอบ
app.get('/', (req, res) => {
  res.send('Hello from Clinic System Backend!');
});

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Please provide username, password, and role' });
    }
    const existingUser = await prisma.user.findUnique({ where: { username: username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        role: role,
      },
    });
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    const user = await prisma.user.findUnique({ where: { username: username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ message: 'Login successful', token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Test Protected Routes ---
app.get('/api/test/protected', isAuthenticated, (req, res) => {
  res.json({ message: 'You accessed a protected route!', user: req.user });
});
app.get('/api/test/reception', isAuthenticated, hasRole(['RECEPTION', 'ADMIN']), (req, res) => {
  res.json({ message: 'Welcome Reception or Admin!', user: req.user });
});
app.get('/api/test/clinician', isAuthenticated, hasRole(['CLINICIAN']), (req, res) => {
  res.json({ message: 'Welcome Clinician!', user: req.user });
});

// --- User Routes ---
app.get('/api/users/clinicians',
  isAuthenticated,
  hasRole(['RECEPTION', 'ADMIN']),
  async (req, res) => {
    try {
      const clinicians = await prisma.user.findMany({
        where: {
          role: 'CLINICIAN',
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
        },
      });
      res.json(clinicians);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching clinicians' });
    }
  }
);


// --- Patient Routes (CRUD) ---
app.post('/api/patients', isAuthenticated, hasRole(['RECEPTION', 'ADMIN']), async (req, res) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, allergies, medicalHistory, currentMedications } = req.body;
    const newPatient = await prisma.patient.create({
      data: {
        firstName, lastName, gender, dateOfBirth: new Date(dateOfBirth),
        allergies, medicalHistory, currentMedications,
        recordNumber: "TEMP",
      },
    });
    const recordNumber = `PAT-${newPatient.id.toString().padStart(3, '0')}`;
    const updatedPatient = await prisma.patient.update({
      where: { id: newPatient.id },
      data: { recordNumber: recordNumber },
    });
    res.status(201).json(updatedPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating patient' });
  }
});

app.get('/api/patients', isAuthenticated, async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'desc' }
    });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
});

app.get('/api/patients/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findFirst({
      where: { id: parseInt(id), deletedAt: null },
    });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching patient' });
  }
});

app.put('/api/patients/:id', isAuthenticated, hasRole(['RECEPTION', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: { ...data, dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined },
    });
    res.json(updatedPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating patient' });
  }
});

app.delete('/api/patients/:id', isAuthenticated, hasRole(['RECEPTION', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.patient.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting patient' });
  }
});

// --- Appointment Routes (CRUD) ---
app.post('/api/appointments',
  isAuthenticated,
  hasRole(['RECEPTION', 'ADMIN']),
  async (req, res) => {
    try {
      const { patientId, clinicianId, startTime, endTime, note } = req.body;
      const createdById = req.user.userId; 

      const start = new Date(startTime);
      const end = new Date(endTime);

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          clinicianId: clinicianId,
          deletedAt: null,
          AND: [
            { startTime: { lt: end } }, 
            { endTime: { gt: start } },
          ],
        },
      });

      if (conflictingAppointment) {
        return res.status(409).json({ message: 'Appointment time conflicts with an existing appointment.' });
      }

      const newAppointment = await prisma.appointment.create({
        data: {
          patientId,
          clinicianId,
          startTime: start,
          endTime: end,
          note,
          createdById,
          recordNumber: "TEMP",
        },
      });

      const recordNumber = `APT-${newAppointment.id.toString().padStart(3, '0')}`;
      const updatedAppointment = await prisma.appointment.update({
        where: { id: newAppointment.id },
        data: { recordNumber: recordNumber },
        include: {
          patient: true,
          clinician: { select: { username: true } },
        },
      });

      res.status(201).json(updatedAppointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error creating appointment' });
    }
  }
);

app.get('/api/appointments',
  isAuthenticated,
  async (req, res) => {
    try {
      const { role, userId } = req.user;
      let whereClause = { deletedAt: null };

      if (role === 'CLINICIAN') {
        whereClause.clinicianId = userId;
      }

      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, recordNumber: true } },
          clinician: { select: { id: true, username: true } },
        },
        orderBy: {
          startTime: 'asc'
        }
      });
      res.json(appointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching appointments' });
    }
  }
);

app.get('/api/appointments/:id',
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, userId } = req.user;
      
      let whereClause = { 
        id: parseInt(id),
        deletedAt: null 
      };

      if (role === 'CLINICIAN') {
        whereClause.clinicianId = userId;
      }

      const appointment = await prisma.appointment.findFirst({
        where: whereClause,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, recordNumber: true } },
          clinician: { select: { id: true, username: true } },
        },
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found or access denied.' });
      }

      res.json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching appointment' });
    }
  }
);

app.put('/api/appointments/:id',
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, userId } = req.user;
      const body = req.body;

      let dataToUpdate = {};
      let whereClause = { id: parseInt(id) };

      if (role === 'CLINICIAN') {
        if (body.status) dataToUpdate.status = body.status;
        if (body.clinicianNote) dataToUpdate.clinicianNote = body.clinicianNote;
        whereClause.clinicianId = userId; 

      } else if (role === 'RECEPTION' || role === 'ADMIN') {
        if (body.patientId) dataToUpdate.patientId = body.patientId;
        if (body.clinicianId) dataToUpdate.clinicianId = body.clinicianId;
        if (body.startTime) dataToUpdate.startTime = new Date(body.startTime);
        if (body.endTime) dataToUpdate.endTime = new Date(body.endTime);
        if (body.note) dataToUpdate.note = body.note;
      }

      const updatedAppointment = await prisma.appointment.update({
        where: whereClause,
        data: dataToUpdate,
      });

      res.json(updatedAppointment);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Appointment not found or access denied.' });
      }
      console.error(error);
      res.status(500).json({ message: 'Server error updating appointment' });
    }
  }
);

app.delete('/api/appointments/:id',
  isAuthenticated,
  hasRole(['RECEPTION', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      // Soft Delete: Set deletedAt field
      await prisma.appointment.update({
        where: {
          id: parseInt(id),
        },
        data: {
          deletedAt: new Date(), 
        },
      });
      
      res.status(204).send(); // 204 No Content
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error deleting appointment' });
    }
  }
);


// เริ่มรัน Server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});