import { useRef, useState } from "react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null0);
  return <div>Message Input</div>;
};

export default MessageInput;
