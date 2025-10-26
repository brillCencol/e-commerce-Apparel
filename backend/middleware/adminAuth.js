import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    let token = req.headers.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.json({ success: false, message: "Not Authorized. Login again." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.email !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: "Not Authorized." });
    }

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuth;
