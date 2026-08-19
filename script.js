const fs = require('fs');

const modalPath = 'app/components/fitness/progress/progress-chat-modal.tsx';
const chatbotPath = 'app/components/fitness/chatbot/fitness-chatbot.tsx';

let modalContent = fs.readFileSync(modalPath, 'utf8');
let chatbotContent = fs.readFileSync(chatbotPath, 'utf8');

// Extract the isOpen modal JSX from modalContent
const modalMatch = modalContent.match(/\{isOpen && \(\s*<>\s*(<motion\.div[\s\S]*?)<\/>\s*\)\}/);
if (!modalMatch) {
  console.error('Could not find modal JSX');
  process.exit(1);
}
let modalJSX = modalMatch[1];

// Make sure it uses setIsOpen(false) instead of onClose
modalJSX = modalJSX.replace(/onClick=\{onClose\}/g, 'onClick={() => setIsOpen(false)}');

// Fix the role check since chatbot uses 'assistant' not 'ai'
modalJSX = modalJSX.replace(/msg\.role === "ai"/g, 'msg.role === "assistant"');

// We need to keep the handleSend/sendMessage mapping.
// Modal uses handleSend, Chatbot uses sendMessage.
// But the modal JSX doesn't have the form, it has input + button. Let's adapt it.
// The input uses handleSend, let's change it to just trigger the form or change handleSend to sendMessage.
modalJSX = modalJSX.replace(/handleSend/g, 'sendMessage');
modalJSX = modalJSX.replace(/msg\.role === "user" \? \(\s*msg\.content\s*\) : \(\s*<ReactMarkdown>\{msg\.content\}<\/ReactMarkdown>\s*\)/g, 
  msg.role === "user" ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="m-0" {...props} />,
                          strong: ({ node, ...props }) => <strong className="text-[#ADFF00] font-bold" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ));

// We need to replace the AnimatePresence for isOpen in fitness-chatbot.tsx
const chatReplaceMatch = chatbotContent.match(/\{isOpen && \([\s\S]*?<\/motion\.div>\s*\)\}/);
if (chatReplaceMatch) {
  chatbotContent = chatbotContent.replace(chatReplaceMatch[0], '{isOpen && (\n        <>\n          ' + modalJSX + '\n        </>\n      )}');
}

// In fitness-chatbot, sendMessage expects a form event. So let's wrap the input area in a form.
chatbotContent = chatbotContent.replace(
  /<div className="p-5 border-t border-white\/5 bg-\[#0A1108\] shrink-0">([\s\S]*?)<\/div>\s*<\/motion\.div>/,
  '<form onSubmit={sendMessage} className="p-5 border-t border-white/5 bg-[#0A1108] shrink-0"></form>\n          </motion.div>'
);
// Now we change the button to type="submit" and remove onClick={sendMessage}
chatbotContent = chatbotContent.replace(/<button[^>]*onClick=\{sendMessage\}[^>]*>/, (match) => {
  return match.replace('onClick={sendMessage}', '').replace('<button', '<button type="submit"');
});
// and change input onKeyDown to do nothing special since form will handle Enter
chatbotContent = chatbotContent.replace(/onKeyDown=\{\(e\) => e\.key === "Enter" && sendMessage\(\)\}/, '');


fs.writeFileSync(chatbotPath, chatbotContent);
console.log('Replaced JSX');
