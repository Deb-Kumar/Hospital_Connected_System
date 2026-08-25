const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');

async function findAccountById(id, role) {
  if (role === 'ADMIN') return await Admin.findById(id);
  if (role === 'DOCTOR') return await Doctor.findById(id);
  if (role === 'STAFF' || role === 'RECEPTIONIST') return await Staff.findById(id);
  if (role === 'PATIENT') return await Patient.findById(id);

  // Fallback search across all role collections
  return (await Admin.findById(id)) ||
         (await Doctor.findById(id)) ||
         (await Staff.findById(id)) ||
         (await Patient.findById(id));
}

// Verifies the JWT and attaches { id, role, email, fullName } to req.user
async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await findAccountById(decoded.id, decoded.role);
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'User account not found or inactive' });
    }
    req.user = { _id: user._id.toString(), id: user._id.toString(), role: user.role || decoded.role, email: user.email, fullName: user.fullName, phone: user.phone };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Restricts a route to specific roles, e.g. requireRole('DOCTOR', 'ADMIN', 'STAFF', 'RECEPTIONIST')
function requireRole(...roles) {
  return (req, res, next) => {
    // Map RECEPTIONIST to STAFF or vice-versa for backwards compatibility
    const allowedRoles = [...roles];
    if (roles.includes('RECEPTIONIST') && !roles.includes('STAFF')) allowedRoles.push('STAFF');
    if (roles.includes('STAFF') && !roles.includes('RECEPTIONIST')) allowedRoles.push('RECEPTIONIST');

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied for this role' });
    }
    next();
  };
}

module.exports = { protect, requireRole };
