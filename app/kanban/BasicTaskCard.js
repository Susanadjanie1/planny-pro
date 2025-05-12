// "use client";

// export default function BasicTaskCard({ task }) {
//   // Get priority label & styling
//   function getPriorityBadge(priority) {
//     switch (priority) {
//       case 'high':
//         return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">High</span>;
//       case 'medium':
//         return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Medium</span>;
//       case 'low':
//         return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Low</span>;
//       default:
//         return null;
//     }
//   }

//   // Get status label & styling
//   function getStatusBadge(status) {
//     switch (status) {
//       case 'done':
//         return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Done</span>;
//       case 'in_progress':
//         return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">In Progress</span>;
//       case 'todo':
//         return <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">To Do</span>;
//       default:
//         return null;
//     }
//   }

//   return (
//     <div className="bg-white p-3 rounded shadow-md border border-gray-200">
//       <div className="flex justify-between items-start">
//         <h4 className="font-semibold text-gray-800">{task.title}</h4>
//         <div className="flex space-x-1">
//           {getStatusBadge(task.status)}
//           {getPriorityBadge(task.priority)}
//         </div>
//       </div>
      
//       <p className="text-sm text-gray-600 mt-1">{task.description}</p>
//       <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      
//       {/* Assigned To - Read Only */}
//       {task.assignedTo && task.assignedTo.length > 0 && (
//         <p className="text-xs text-gray-600 mt-1">
//           Assigned to: {task.assignedTo.map(user => user.email || user).join(', ')}
//         </p>
//       )}
//     </div>
//   );
// }