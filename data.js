const WORKOUTS = [
 {id:1,title:"Full Body Beginner",category:"Full Body",level:"Beginner",minutes:18,exercises:8,calories:120,equipment:"No Equipment",image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700",description:"A balanced introduction to strength and movement."},
 {id:2,title:"Abs & Core Builder",category:"Abs",level:"Intermediate",minutes:15,exercises:7,calories:105,equipment:"No Equipment",image:"https://images.unsplash.com/photo-1566241142559-40e1kh5b4f4?w=700",description:"Build a stronger core with controlled movements."},
 {id:3,title:"Chest Strength",category:"Chest",level:"Intermediate",minutes:22,exercises:9,calories:160,equipment:"Dumbbells",image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700",description:"Train your chest with simple home strength exercises."},
 {id:4,title:"Leg Day Express",category:"Legs",level:"Beginner",minutes:12,exercises:6,calories:90,equipment:"No Equipment",image:"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700",description:"Wake up your legs with an efficient lower-body session."},
 {id:5,title:"Arm Strength Training",category:"Arms",level:"Advanced",minutes:25,exercises:10,calories:185,equipment:"Dumbbells",image:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700",description:"Progressive arm training for strength and control."},
 {id:6,title:"Morning Mobility",category:"Stretch",level:"Beginner",minutes:7,exercises:5,calories:35,equipment:"No Equipment",image:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=700",description:"Gentle movement to help you start the day."},
 {id:7,title:"Back & Posture",category:"Back",level:"Intermediate",minutes:16,exercises:7,calories:110,equipment:"Resistance Band",image:"https://images.unsplash.com/photo-1517838277536-fc3d2d4a4d8a?w=700",description:"Improve upper-body strength and posture."},
 {id:8,title:"Shoulder Sculpt",category:"Shoulders",level:"Advanced",minutes:20,exercises:8,calories:145,equipment:"Dumbbells",image:"https://images.unsplash.com/photo-1534368270820-9de3d8053204?w=700",description:"Build shoulder stability and strength."}
];
const TRAINERS = [
 {id:1,name:"Alex Morgan",specialty:"Strength & Muscle Building",cert:"Certified Personal Trainer",experience:"8 years",rating:4.9,price:399,subs:1240,image:"https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300"},
 {id:2,name:"Sofia Reyes",specialty:"Weight Loss & Fitness",cert:"ACE Certified Coach",experience:"6 years",rating:4.8,price:699,subs:980,image:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300"},
 {id:3,name:"Marcus Lee",specialty:"Beginner Fitness",cert:"NASM Certified Trainer",experience:"5 years",rating:4.9,price:199,subs:760,image:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"}
];
const EXERCISES = [
 {name:"Jumping Jacks",reps:"30 sec",image:"https://images.unsplash.com/photo-1599058917212-d750089bc07c?w=900",instruction:"Jump lightly while moving your arms overhead. Land softly with knees relaxed."},
 {name:"Bodyweight Squats",reps:"12 reps",image:"https://images.unsplash.com/photo-1566241142559-40e1kh5b4f4?w=900",instruction:"Keep your chest lifted, push hips back, and lower with control."},
 {name:"Knee Push-ups",reps:"10 reps",image:"https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=900",instruction:"Keep a straight line from shoulders to knees and lower your chest slowly."},
 {name:"Plank Hold",reps:"30 sec",image:"https://images.unsplash.com/photo-1566241142559-40e1kh5b4f4?w=900",instruction:"Keep your elbows below shoulders and brace your core without holding your breath."},
 {name:"Standing Stretch",reps:"30 sec",image:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900",instruction:"Move gently into the stretch. Stop if you feel pain."}
];
const DEFAULT_NOTIFICATIONS = [
 {id:1,title:"Welcome to FITCONNECT!",body:"Your fitness journey starts today. Explore your training dashboard.",time:"Just now",read:false},
 {id:2,title:"Weekly goal reminder",body:"You are one workout away from your weekly target.",time:"Yesterday",read:false},
 {id:3,title:"New trainer feedback",body:"Your coach has shared a few tips for your next session.",time:"2 days ago",read:true}
];
