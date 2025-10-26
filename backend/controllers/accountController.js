import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';

// GET /api/user/me
export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select('_id name email');
    if (!user) return res.json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: e.message });
  }
};

// PUT /api/user/me
export const updateMe = async (req, res) => {
  try {
    const { name, email } = req.body; // (optional) validate/unique email if you allow changing it
    const updated = await userModel
      .findByIdAndUpdate(req.body.userId, { name, email }, { new: true, runValidators: true })
      .select('_id name email');
    res.json({ success: true, user: updated });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: e.message });
  }
};

// PUT /api/user/password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.body.userId);
    if (!user) return res.json({ success: false, message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.json({ success: false, message: 'Current password is incorrect' });

    if (!newPassword || String(newPassword).length < 8) {
      return res.json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated' });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: e.message });
  }
};
