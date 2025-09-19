import User from "../models/user.model.js";

export const publishPublicKey = async (req, res) => {
  try {
    const userId = req.user._id;
    const { publicKey } = req.body;
    if (!publicKey) {
      return res.status(400).json({ message: "publicKey required" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { publicKey },
      { new: true }
    );
    console.log("Updated user with key:", updatedUser.publicKey);
    res.status(200).json({ message: "public key saved" });
  } catch (error) {
    console.error("Error in publishPublicKey: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPublicKey = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("publicKey");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ publicKey: user.publicKey });
  } catch (error) {
    console.error("Error in getUserPublicKey: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
