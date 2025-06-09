import { 
  Stethoscope, 
  Wrench, 
  Scale, 
  Trophy, 
  Code, 
  BookOpen,
  GraduationCap,
  Building,
  Calculator,
  Globe,
  Brain,
  Laptop
} from 'lucide-react';

export const examCategories = {
  medical: {
    name: 'Medical Exams',
    icon: Stethoscope,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    exams: [
      {
        id: 'neet-ug',
        name: 'NEET-UG',
        fullName: 'National Eligibility cum Entrance Test (Undergraduate)',
        subjects: ['Physics', 'Chemistry', 'Biology'],
        description: 'Medical entrance exam for MBBS/BDS courses'
      },
      {
        id: 'neet-pg',
        name: 'NEET-PG',
        fullName: 'National Eligibility cum Entrance Test (Postgraduate)',
        subjects: ['Clinical Medicine', 'Surgery', 'Pathology', 'Pharmacology'],
        description: 'Medical entrance exam for MD/MS courses'
      },
      {
        id: 'usmle',
        name: 'USMLE',
        fullName: 'United States Medical Licensing Examination',
        subjects: ['Basic Sciences', 'Clinical Knowledge', 'Clinical Skills'],
        description: 'Medical licensing exam for practicing in the US'
      },
      {
        id: 'aiims',
        name: 'AIIMS',
        fullName: 'All Institute of Medical Sciences',
        subjects: ['Physics', 'Chemistry', 'Biology', 'General Knowledge'],
        description: 'Medical entrance exam for AIIMS institutes'
      }
    ]
  },
  engineering: {
    name: 'Engineering Exams',
    icon: Wrench,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    exams: [
      {
        id: 'jee-mains',
        name: 'JEE Mains',
        fullName: 'Joint Entrance Examination (Main)',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        description: 'Engineering entrance exam for NITs, IIITs, and other colleges'
      },
      {
        id: 'jee-advanced',
        name: 'JEE Advanced',
        fullName: 'Joint Entrance Examination (Advanced)',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        description: 'Engineering entrance exam for IITs'
      },
      {
        id: 'gate',
        name: 'GATE',
        fullName: 'Graduate Aptitude Test in Engineering',
        subjects: ['Engineering Mathematics', 'General Aptitude', 'Core Engineering'],
        description: 'Postgraduate engineering entrance exam'
      },
      {
        id: 'bitsat',
        name: 'BITSAT',
        fullName: 'Birla Institute of Technology and Science Admission Test',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Logical Reasoning'],
        description: 'Engineering entrance exam for BITS campuses'
      }
    ]
  },
  civilServices: {
    name: 'Civil Services',
    icon: Scale,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    exams: [
      {
        id: 'upsc-prelims',
        name: 'UPSC Prelims',
        fullName: 'Union Public Service Commission Preliminary Examination',
        subjects: ['General Studies', 'Current Affairs', 'History', 'Geography', 'Polity'],
        description: 'Civil services preliminary examination'
      },
      {
        id: 'upsc-mains',
        name: 'UPSC Mains',
        fullName: 'Union Public Service Commission Main Examination',
        subjects: ['Essay', 'General Studies', 'Optional Subject'],
        description: 'Civil services main examination'
      },
      {
        id: 'cgpsc',
        name: 'CGPSC',
        fullName: 'Chhattisgarh Public Service Commission',
        subjects: ['General Studies', 'Chhattisgarh GK', 'Current Affairs'],
        description: 'Chhattisgarh state civil services exam'
      },
      {
        id: 'mppsc',
        name: 'MPPSC',
        fullName: 'Madhya Pradesh Public Service Commission',
        subjects: ['General Studies', 'MP GK', 'Current Affairs'],
        description: 'Madhya Pradesh state civil services exam'
      }
    ]
  },
  competitive: {
    name: 'Competitive Exams',
    icon: Trophy,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    exams: [
      {
        id: 'ssc-cgl',
        name: 'SSC CGL',
        fullName: 'Staff Selection Commission Combined Graduate Level',
        subjects: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English'],
        description: 'Central government jobs exam'
      },
      {
        id: 'banking-po',
        name: 'Banking PO',
        fullName: 'Probationary Officer',
        subjects: ['Reasoning', 'Quantitative Aptitude', 'English', 'General Awareness', 'Computer'],
        description: 'Banking sector officer exam'
      },
      {
        id: 'rrb-ntpc',
        name: 'RRB NTPC',
        fullName: 'Railway Recruitment Board Non-Technical Popular Categories',
        subjects: ['General Awareness', 'Mathematics', 'General Intelligence'],
        description: 'Railway non-technical jobs exam'
      },
      {
        id: 'state-psc',
        name: 'State PSCs',
        fullName: 'State Public Service Commissions',
        subjects: ['General Studies', 'State GK', 'Current Affairs'],
        description: 'Various state government jobs exams'
      }
    ]
  },
  programming: {
    name: 'Programming & Tech',
    icon: Code,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    exams: [
      {
        id: 'javascript',
        name: 'JavaScript',
        fullName: 'JavaScript Programming',
        subjects: ['ES6+', 'DOM Manipulation', 'Async Programming', 'Frameworks'],
        description: 'JavaScript programming concepts and best practices'
      },
      {
        id: 'python',
        name: 'Python',
        fullName: 'Python Programming',
        subjects: ['Core Python', 'Data Structures', 'Libraries', 'Web Development'],
        description: 'Python programming fundamentals and advanced topics'
      },
      {
        id: 'cpp',
        name: 'C++',
        fullName: 'C++ Programming',
        subjects: ['OOP Concepts', 'STL', 'Memory Management', 'Templates'],
        description: 'C++ programming language concepts'
      },
      {
        id: 'dsa',
        name: 'DSA',
        fullName: 'Data Structures and Algorithms',
        subjects: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting'],
        description: 'Data structures and algorithms for competitive programming'
      },
      {
        id: 'react',
        name: 'React',
        fullName: 'React.js Framework',
        subjects: ['Components', 'Hooks', 'State Management', 'Routing'],
        description: 'React.js library for building user interfaces'
      },
      {
        id: 'nodejs',
        name: 'Node.js',
        fullName: 'Node.js Runtime',
        subjects: ['Express.js', 'APIs', 'Database Integration', 'Authentication'],
        description: 'Node.js for backend development'
      }
    ]
  },
  academic: {
    name: 'Academic Subjects',
    icon: BookOpen,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    exams: [
      {
        id: 'mathematics',
        name: 'Mathematics',
        fullName: 'Mathematics',
        subjects: ['Algebra', 'Calculus', 'Geometry', 'Statistics'],
        description: 'Mathematical concepts and problem solving'
      },
      {
        id: 'physics',
        name: 'Physics',
        fullName: 'Physics',
        subjects: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Modern Physics'],
        description: 'Physics concepts and applications'
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        fullName: 'Chemistry',
        subjects: ['Organic', 'Inorganic', 'Physical Chemistry'],
        description: 'Chemistry concepts and reactions'
      },
      {
        id: 'biology',
        name: 'Biology',
        fullName: 'Biology',
        subjects: ['Botany', 'Zoology', 'Genetics', 'Ecology'],
        description: 'Biological sciences and life processes'
      },
      {
        id: 'english',
        name: 'English',
        fullName: 'English Language',
        subjects: ['Grammar', 'Vocabulary', 'Comprehension', 'Writing'],
        description: 'English language skills and literature'
      },
      {
        id: 'history',
        name: 'History',
        fullName: 'History',
        subjects: ['Ancient History', 'Medieval History', 'Modern History', 'World History'],
        description: 'Historical events and civilizations'
      }
    ]
  }
};

export const difficultyLevels = [
  { value: 'easy', label: 'Easy', description: 'Basic level questions' },
  { value: 'medium', label: 'Medium', description: 'Intermediate level questions' },
  { value: 'hard', label: 'Hard', description: 'Advanced level questions' }
];

export const questionCounts = [
  { value: 5, label: '5 Questions', duration: '5-10 minutes' },
  { value: 10, label: '10 Questions', duration: '10-20 minutes' },
  { value: 15, label: '15 Questions', duration: '15-30 minutes' },
  { value: 20, label: '20 Questions', duration: '20-40 minutes' },
  { value: 25, label: '25 Questions', duration: '25-50 minutes' }
];

export const timeLimitOptions = [
  { value: 'per_question', label: 'Time per Question', options: [30, 45, 60, 90, 120] },
  { value: 'total_duration', label: 'Total Quiz Duration', options: [10, 15, 20, 30, 45, 60] }
];

// Helper functions
export const getAllExams = () => {
  const allExams = [];
  Object.values(examCategories).forEach(category => {
    category.exams.forEach(exam => {
      allExams.push({
        ...exam,
        category: category.name,
        categoryId: Object.keys(examCategories).find(key => examCategories[key] === category)
      });
    });
  });
  return allExams;
};

export const getExamById = (examId) => {
  const allExams = getAllExams();
  return allExams.find(exam => exam.id === examId);
};

export const getExamsByCategory = (categoryId) => {
  return examCategories[categoryId]?.exams || [];
};

export const searchExams = (searchTerm) => {
  const allExams = getAllExams();
  const term = searchTerm.toLowerCase();
  return allExams.filter(exam => 
    exam.name.toLowerCase().includes(term) ||
    exam.fullName.toLowerCase().includes(term) ||
    exam.subjects.some(subject => subject.toLowerCase().includes(term))
  );
};
