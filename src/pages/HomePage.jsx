"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { QrCode, UserPlus, DoorClosed, Users, ArrowRight } from "lucide-react"
import QRCodeModal from "../components/QRCodeModal"

const HomePage = () => {
  const navigate = useNavigate()
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  const tasks = [
    {
      title: "Request Visit",
      subtitle: "विज़िट का अनुरोध",
      icon: <UserPlus className="text-white" size={24} />,
      color: "bg-sky-500",
      path: "/dashboard/assign-task",
      description: "Fill visitor details and capture photo"
    },
    {
      title: "Close Gate Pass",
      subtitle: "गेट पास बंद करें",
      icon: <DoorClosed className="text-white" size={24} />,
      color: "bg-red-500",
      path: "/dashboard/close-gate-pass",
      description: "Mark visitor as departed"
    },
    {
      title: "Employee Status",
      subtitle: "कर्मचारी",
      icon: <Users className="text-white" size={24} />,
      color: "bg-green-500",
      path: "/dashboard/employee",
      description: "Check employee presence/status"
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-800">Welcome to GatePass!</h1>
            <p className="text-gray-500 mt-2 max-w-md">Manage your visitors efficiently with our automated gate pass system.</p>
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-200"
            >
              <QrCode size={20} />
              Show Visitor QR
            </button>
          </div>
          <div className="hidden md:block">
            <img src="/botivate_logo.jpg" alt="Logo" className="h-24 w-auto rounded-2xl border border-gray-100 p-2" />
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-sky-50 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tasks.map((task, index) => (
            <button
              key={index}
              onClick={() => navigate(task.path)}
              className="group text-left p-6 bg-white rounded-3xl border border-sky-50 shadow-lg hover:shadow-2xl hover:border-sky-200 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`${task.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                {task.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
              <p className="text-sm font-semibold text-sky-600 mt-1">{task.subtitle}</p>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">{task.description}</p>
              
              <div className="mt-6 flex items-center gap-2 text-sky-500 font-bold text-sm">
                <span>Launch</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Hover effect background */}
              <div className={`absolute right-0 bottom-0 w-24 h-24 ${task.color} opacity-[0.03] rounded-tl-full transition-all group-hover:scale-150`}></div>
            </button>
          ))}
        </div>

      <QRCodeModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
      />
    </div>
  )
}

export default HomePage
