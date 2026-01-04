const mongoose = require('mongoose');
const { Schema } = mongoose;

const VerifiedSkillSchema = new Schema({
  skill: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  score: { type: Number, required: true },
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Client', 'Admin'], required: true },
  verifiedSkills: { type: [VerifiedSkillSchema], default: [] },
  cvUrl: { type: String },
});

// Export the User model
module.exports = mongoose.model('User', UserSchema);
