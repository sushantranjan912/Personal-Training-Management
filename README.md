🚀 Personnel Training Management (PTM)

🔗 Live Demo  
https://personal-training-management.onrender.com

A full-stack web application designed to manage employee training programs, track progress, evaluate performance, and generate insights through analytics dashboards.  
It provides a complete workflow from course assignment to certification and feedback.

---

📌 Project Overview

This system helps organizations streamline training processes.  
Admins can manage employees and programs, while employees can learn, take quizzes, and track their progress.

The application uses REST APIs for communication and provides a dynamic user experience without page reloads.

---

✨ Key Features

👨‍💼 Admin Side  
• Manage employees (add, update, delete)  
• Create and manage training programs  
• Assign courses to employees  
• Track employee progress  
• View analytics and reports  
• Analyze feedback and ratings  

👨‍🎓 Employee Side  
• View assigned courses  
• Study learning content  
• Attempt quizzes (60% passing criteria)  
• Track progress in real time  
• Receive certificates after completion  
• Submit feedback with star ratings ⭐  
• View notifications and profile  

---

🧠 Core Functionalities

🔐 Authentication  
• Secure login using JWT  
• Role-based access control  

📊 Reports & Analytics  
• Completion rate tracking  
• Course popularity analysis  
• Average rating calculation  
• Charts and visual insights  

⭐ Feedback System  
• Star-based rating system  
• Comments and suggestions  
• Helps improve training quality  

📜 Certificate System  
• Generated after course completion  
• Based on quiz performance  
• Dynamically rendered  

---

🛠️ Technology Stack

💻 Frontend  
• HTML  
• CSS  
• JavaScript  
• Chart.js  

⚙️ Backend  
• Node.js  
• Express.js  

🗄️ Database  
• MongoDB  
• Mongoose  

🔐 Authentication  
• JSON Web Tokens (JWT)  

---

🔄 Application Flow

User logs in → token stored → role-based redirect → frontend calls APIs → backend processes request → database interaction → response returned → UI updates dynamically.

---

🔌 API Examples

POST   /api/auth/login       → Login  
POST   /api/auth/register    → Register  
GET    /api/employees        → Employees data  
POST   /api/programs         → Create program  
PUT    /api/enrollments/:id  → Update progress  
GET    /api/reports          → Analytics  

---

🔗 Data Relationships

• Employee ↔ Enrollment ↔ Program  
• User ↔ Feedback ↔ Program  

MongoDB uses ObjectId references to manage relationships between collections.

---

⚡ Highlights

• Dynamic UI without page reload  
• Real-time updates using APIs  
• Clean dashboard interface  
• Modular and scalable structure  
• Role-based system  

---

🚀 Future Improvements

• PDF certificate download  
• Email notifications  
• Advanced analytics  
• Improved mobile responsiveness  

---

👨‍💻 Author

Sushant Ranjan  

---

💡 Final Note

This project delivers a complete training management solution covering learning, evaluation, certification, and feedback in a single platform.
