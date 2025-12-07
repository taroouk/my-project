import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, TrendingUp, Plus, Search, Filter, Eye, CreditCard as Edit, Trash2, Clock, Award, FileText, Download, ArrowLeft, Star, Minus } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills?: string[];
  deductions?: Deduction[];
}

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent' | 'half-day';
  hoursWorked?: number;
}

interface Leave {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'emergency' | 'maternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Performance {
  id: string;
  employeeId: string;
  period: string;
  rating: number;
  goals: string;
  achievements: string;
  notes: string;
  date: string;
}

interface Deduction {
  id: string;
  type: 'absence' | 'late' | 'violation' | 'loan' | 'other';
  amount: number;
  reason: string;
  date: string;
}

const HRDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'أحمد محمد علي',
      email: 'ahmed@company.com',
      phone: '+966501234567',
      position: 'مطور برمجيات',
      department: 'تقنية المعلومات',
      salary: 8000,
      hireDate: '2023-01-15',
      status: 'active',
      emergencyContact: {
        name: 'فاطمة أحمد',
        phone: '+966507654321',
        relationship: 'زوجة'
      },
      skills: ['React', 'Node.js', 'TypeScript'],
      deductions: []
    },
    {
      id: '2',
      name: 'سارة أحمد حسن',
      email: 'sara@company.com',
      phone: '+966502345678',
      position: 'مديرة تسويق',
      department: 'التسويق',
      salary: 9500,
      hireDate: '2022-08-20',
      status: 'active',
      emergencyContact: {
        name: 'محمد حسن',
        phone: '+966508765432',
        relationship: 'أب'
      },
      skills: ['التسويق الرقمي', 'إدارة المشاريع', 'التحليل'],
      deductions: []
    }
  ]);

  const [attendance, setAttendance] = useState<Attendance[]>([
    {
      id: '1',
      employeeId: '1',
      date: '2024-01-15',
      checkIn: '08:00',
      checkOut: '17:00',
      status: 'present',
      hoursWorked: 9
    },
    {
      id: '2',
      employeeId: '2',
      date: '2024-01-15',
      checkIn: '08:30',
      checkOut: '17:30',
      status: 'late',
      hoursWorked: 9
    }
  ]);

  const [leaves, setLeaves] = useState<Leave[]>([
    {
      id: '1',
      employeeId: '1',
      type: 'annual',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      days: 5,
      reason: 'إجازة سنوية',
      status: 'approved'
    }
  ]);

  const [performances, setPerformances] = useState<Performance[]>([
    {
      id: '1',
      employeeId: '1',
      period: '2024-Q1',
      rating: 4,
      goals: 'تطوير 3 مشاريع جديدة',
      achievements: 'تم تطوير مشروعين بنجاح',
      notes: 'أداء ممتاز',
      date: '2024-01-15'
    }
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    skills: ''
  });

  const [newAttendance, setNewAttendance] = useState<{
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'present' | 'late' | 'absent' | 'half-day';
  }>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present'
  });

  const [newLeave, setNewLeave] = useState<{
    employeeId: string;
    type: 'annual' | 'sick' | 'emergency' | 'maternity';
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    employeeId: '',
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [newPerformance, setNewPerformance] = useState({
    employeeId: '',
    period: '',
    rating: 5,
    goals: '',
    achievements: '',
    notes: ''
  });

  const [newDeduction, setNewDeduction] = useState<{
    type: 'absence' | 'late' | 'violation' | 'loan' | 'other';
    amount: string;
    reason: string;
  }>({
    type: 'absence',
    amount: '',
    reason: ''
  });

  const departments = ['تقنية المعلومات', 'التسويق', 'المبيعات', 'الموارد البشرية', 'المالية', 'العمليات'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === '' || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: Employee = {
      id: (employees.length + 1).toString(),
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      position: newEmployee.position,
      department: newEmployee.department,
      salary: parseFloat(newEmployee.salary),
      hireDate: newEmployee.hireDate,
      status: 'active',
      emergencyContact: {
        name: newEmployee.emergencyContactName,
        phone: newEmployee.emergencyContactPhone,
        relationship: newEmployee.emergencyContactRelationship
      },
      skills: newEmployee.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      deductions: []
    };

    setEmployees(prev => [...prev, employee]);
    setNewEmployee({
      name: '', email: '', phone: '', position: '', department: '', salary: '', hireDate: '',
      emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '', skills: ''
    });
    setShowAddEmployee(false);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setAttendance(prev => prev.filter(att => att.employeeId !== employeeId));
      setLeaves(prev => prev.filter(leave => leave.employeeId !== employeeId));
      setPerformances(prev => prev.filter(perf => perf.employeeId !== employeeId));
    }
  };

  const handleAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const checkInTime = new Date(`${newAttendance.date}T${newAttendance.checkIn}`);
    const checkOutTime = newAttendance.checkOut ? new Date(`${newAttendance.date}T${newAttendance.checkOut}`) : null;
    const hoursWorked = checkOutTime ? (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) : 0;

    const attendanceRecord: Attendance = {
      id: (attendance.length + 1).toString(),
      employeeId: newAttendance.employeeId,
      date: newAttendance.date,
      checkIn: newAttendance.checkIn,
      checkOut: newAttendance.checkOut || undefined,
      status: newAttendance.status,
      hoursWorked: Math.round(hoursWorked * 100) / 100
    };

    setAttendance(prev => [...prev, attendanceRecord]);
    setNewAttendance({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'present'
    });
    setShowAttendanceModal(false);
  };

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date(newLeave.startDate);
    const endDate = new Date(newLeave.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRecord: Leave = {
      id: (leaves.length + 1).toString(),
      employeeId: newLeave.employeeId,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      days,
      reason: newLeave.reason,
      status: 'pending'
    };

    setLeaves(prev => [...prev, leaveRecord]);
    setNewLeave({
      employeeId: '',
      type: 'annual',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setShowLeaveModal(false);
  };

  const handleAddPerformance = (e: React.FormEvent) => {
    e.preventDefault();
    const performanceRecord: Performance = {
      id: (performances.length + 1).toString(),
      employeeId: newPerformance.employeeId,
      period: newPerformance.period,
      rating: newPerformance.rating,
      goals: newPerformance.goals,
      achievements: newPerformance.achievements,
      notes: newPerformance.notes,
      date: new Date().toISOString().split('T')[0]
    };

    setPerformances(prev => [...prev, performanceRecord]);
    setNewPerformance({
      employeeId: '',
      period: '',
      rating: 5,
      goals: '',
      achievements: '',
      notes: ''
    });
    setShowPerformanceModal(false);
  };

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployee) {
      const deduction: Deduction = {
        id: Date.now().toString(),
        type: newDeduction.type,
        amount: parseFloat(newDeduction.amount),
        reason: newDeduction.reason,
        date: new Date().toISOString().split('T')[0]
      };

      setEmployees(prev => prev.map(emp =>
        emp.id === selectedEmployee.id
          ? { ...emp, deductions: [...(emp.deductions || []), deduction] }
          : emp
      ));

      setNewDeduction({
        type: 'absence',
        amount: '',
        reason: ''
      });
      setShowDeductionModal(false);
    }
  };

  const updateLeaveStatus = (leaveId: string, status: 'approved' | 'rejected') => {
    setLeaves(prev => prev.map(leave =>
      leave.id === leaveId ? { ...leave, status } : leave
    ));
  };

  const exportData = (type: string) => {
    let data: Array<Employee | Attendance | Leave | Record<string, unknown>> = [];
    let filename = '';

    switch (type) {
      case 'employees':
        data = employees;
        filename = 'employees.csv';
        break;
      case 'attendance':
        data = attendance.map(att => ({
          ...att,
          employeeName: employees.find(emp => emp.id === att.employeeId)?.name || 'غير معروف'
        }));
        filename = 'attendance.csv';
        break;
      case 'leaves':
        data = leaves.map(leave => ({
          ...leave,
          employeeName: employees.find(emp => emp.id === leave.employeeId)?.name || 'غير معروف'
        }));
        filename = 'leaves.csv';
        break;
      case 'payroll':
        data = employees.map(emp => {
          const totalDeductions = (emp.deductions || []).reduce((sum, ded) => sum + ded.amount, 0);
          return {
            name: emp.name,
            salary: emp.salary,
            deductions: totalDeductions,
            netSalary: emp.salary - totalDeductions
          };
        });
        filename = 'payroll.csv';
        break;
    }

    const csvContent = "data:text/csv;charset=utf-8," +
      Object.keys(data[0] || {}).join(",") + "\n" +
      data.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'نشط' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'غير نشط' },
      'on-leave': { color: 'bg-yellow-100 text-yellow-800', text: 'في إجازة' },
      terminated: { color: 'bg-red-100 text-red-800', text: 'منتهي الخدمة' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', text: 'غير معروف' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // حساب الإحصائيات
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalSalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const totalDeductions = employees.reduce((sum, emp) =>
    sum + (emp.deductions || []).reduce((dedSum, ded) => dedSum + ded.amount, 0), 0
  );
  const avgPerformance = performances.length > 0
    ? performances.reduce((sum, perf) => sum + perf.rating, 0) / performances.length
    : 0;

  // توزيع الأقسام
  const departmentDistribution = departments.map(dept => ({
    name: dept,
    count: employees.filter(emp => emp.department === dept).length
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>العودة</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">نظام إدارة الموارد البشرية</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddEmployee(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة موظف</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="flex items-center space-x-3 bg-blue-50 hover:bg-blue-100 rounded-2xl p-4 transition-colors"
          >
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">تسجيل حضور</span>
          </button>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center space-x-3 bg-green-50 hover:bg-green-100 rounded-2xl p-4 transition-colors"
          >
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">طلب إجازة</span>
          </button>
          <button
            onClick={() => exportData('payroll')}
            className="flex items-center space-x-3 bg-purple-50 hover:bg-purple-100 rounded-2xl p-4 transition-colors"
          >
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">كشف الرواتب</span>
          </button>
          <button
            onClick={() => exportData('employees')}
            className="flex items-center space-x-3 bg-orange-50 hover:bg-orange-100 rounded-2xl p-4 transition-colors"
          >
            <Download className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">تصدير التقارير</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', name: 'النظرة العامة', icon: TrendingUp },
              { id: 'employees', name: 'الموظفين', icon: Users },
              { id: 'attendance', name: 'الحضور والانصراف', icon: Clock },
              { id: 'leaves', name: 'الإجازات', icon: Calendar },
              { id: 'payroll', name: 'الرواتب', icon: DollarSign },
              { id: 'performance', name: 'تقييم الأداء', icon: Award },
              { id: 'reports', name: 'التقارير', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">إجمالي الموظفين</p>
                        <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                        <p className="text-xs text-green-600 mt-1">النشطين: {activeEmployees}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">إجمالي الرواتب</p>
                        <p className="text-2xl font-bold text-gray-900">{totalSalaries.toLocaleString()} ر.س</p>
                        <p className="text-xs text-blue-600 mt-1">شهرياً</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">إجمالي الخصومات</p>
                        <p className="text-2xl font-bold text-gray-900">{totalDeductions.toLocaleString()} ر.س</p>
                        <p className="text-xs text-red-600 mt-1">هذا الشهر</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                        <Minus className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">متوسط الأداء</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold text-gray-900">{avgPerformance.toFixed(1)}</p>
                          <RatingStars rating={Math.round(avgPerformance)} />
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع الموظفين حسب الأقسام</h3>
                    <div className="space-y-3">
                      {departmentDistribution.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{dept.name}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(dept.count / totalEmployees) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{dept.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">الإحصائيات المالية</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-green-800 font-medium">إجمالي الرواتب</span>
                        <span className="text-green-900 font-bold">{totalSalaries.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <span className="text-red-800 font-medium">إجمالي الخصومات</span>
                        <span className="text-red-900 font-bold">{totalDeductions.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                        <span className="text-blue-800 font-medium">صافي المدفوعات</span>
                        <span className="text-blue-900 font-bold">{(totalSalaries - totalDeductions).toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">النشاط الأخير</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">تم تسجيل حضور أحمد محمد علي</span>
                      <span className="text-xs text-gray-500 mr-auto">منذ 5 دقائق</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">تم اعتماد إجازة سارة أحمد حسن</span>
                      <span className="text-xs text-gray-500 mr-auto">منذ 15 دقيقة</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">تم إضافة تقييم أداء جديد</span>
                      <span className="text-xs text-gray-500 mr-auto">منذ 30 دقيقة</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'employees' && (
              <div>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="البحث عن موظف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-12 pl-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="pr-12 pl-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="">جميع الأقسام</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Employees Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                            <span className="text-purple-800 font-medium">
                              {employee.name.split(' ')[0][0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{employee.name}</h3>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                            <p className="text-xs text-gray-500">{employee.department}</p>
                          </div>
                        </div>
                        <StatusBadge status={employee.status} />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">الراتب:</span>
                          <span className="font-medium text-gray-900">{employee.salary.toLocaleString()} ر.س</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">تاريخ التوظيف:</span>
                          <span className="text-gray-900">{new Date(employee.hireDate).toLocaleDateString('ar-EG')}</span>
                        </div>
                        {employee.deductions && employee.deductions.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">الخصومات:</span>
                            <span className="text-red-600 font-medium">
                              {employee.deductions.reduce((sum, ded) => sum + ded.amount, 0).toLocaleString()} ر.س
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowEmployeeDetails(true);
                          }}
                          className="px-3 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-colors text-sm flex items-center justify-center"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setNewPerformance(prev => ({ ...prev, employeeId: employee.id }));
                            setShowPerformanceModal(true);
                          }}
                          className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-xl hover:bg-yellow-200 transition-colors text-sm flex items-center justify-center"
                          title="تقييم الأداء"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowDeductionModal(true);
                          }}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
                          title="خصم"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            // يمكن إضافة نافذة تعديل هنا
                          }}
                          className="px-3 py-2 bg-green-100 text-green-800 rounded-xl hover:bg-green-200 transition-colors text-sm flex items-center justify-center"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">سجل الحضور والانصراف</h3>
                  <div className="bg-white/60 rounded-xl overflow-hidden border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50/60">
                        <tr>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الموظف</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الحضور</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الانصراف</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">ساعات العمل</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {attendance.map((record) => {
                          const employee = employees.find(emp => emp.id === record.employeeId);
                          return (
                            <tr key={record.id} className="hover:bg-white/40">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {employee?.name || 'غير معروف'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString('ar-EG')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{record.checkIn}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{record.checkOut || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{record.hoursWorked || 0} ساعة</td>
                              <td className="px-6 py-4">
                                <StatusBadge status={record.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leaves' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {leaves.filter(leave => leave.status === 'approved').length}
                    </div>
                    <div className="text-sm text-gray-600">إجازات معتمدة</div>
                  </div>
                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {leaves.filter(leave => leave.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">في الانتظار</div>
                  </div>
                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      {leaves.filter(leave => leave.status === 'rejected').length}
                    </div>
                    <div className="text-sm text-gray-600">مرفوضة</div>
                  </div>
                </div>

                <div className="bg-white/60 rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50/60">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الموظف</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">نوع الإجازة</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">من</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">إلى</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الأيام</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leaves.map((leave) => {
                        const employee = employees.find(emp => emp.id === leave.employeeId);
                        return (
                          <tr key={leave.id} className="hover:bg-white/40">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {employee?.name || 'غير معروف'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{leave.type}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(leave.startDate).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(leave.endDate).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{leave.days}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={leave.status} />
                            </td>
                            <td className="px-6 py-4">
                              {leave.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => updateLeaveStatus(leave.id, 'approved')}
                                    className="text-green-600 hover:text-green-900 text-sm"
                                  >
                                    اعتماد
                                  </button>
                                  <button
                                    onClick={() => updateLeaveStatus(leave.id, 'rejected')}
                                    className="text-red-600 hover:text-red-900 text-sm"
                                  >
                                    رفض
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payroll' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات الرواتب</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">نسبة الضريبة (%)</label>
                        <input
                          type="number"
                          defaultValue="5"
                          className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">نسبة التأمينات (%)</label>
                        <input
                          type="number"
                          defaultValue="9"
                          className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl"
                        />
                      </div>
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl">
                        حفظ الإعدادات
                      </button>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">ملخص الرواتب</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">إجمالي الرواتب:</span>
                        <span className="font-bold text-gray-900">{totalSalaries.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">إجمالي الخصومات:</span>
                        <span className="font-bold text-red-600">{totalDeductions.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-gray-900 font-medium">صافي المدفوعات:</span>
                        <span className="font-bold text-green-600">{(totalSalaries - totalDeductions).toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50/60">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الموظف</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الراتب الأساسي</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">البدلات</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الخصومات</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الضرائب</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">صافي الراتب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {employees.map((employee) => {
                        const deductions = (employee.deductions || []).reduce((sum, ded) => sum + ded.amount, 0);
                        const tax = employee.salary * 0.05;
                        const insurance = employee.salary * 0.09;
                        const netSalary = employee.salary - deductions - tax - insurance;

                        return (
                          <tr key={employee.id} className="hover:bg-white/40">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{employee.salary.toLocaleString()} ر.س</td>
                            <td className="px-6 py-4 text-sm text-gray-900">0 ر.س</td>
                            <td className="px-6 py-4 text-sm text-red-600">{deductions.toLocaleString()} ر.س</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{(tax + insurance).toLocaleString()} ر.س</td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">{netSalary.toLocaleString()} ر.س</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {performances.map((performance) => {
                    const employee = employees.find(emp => emp.id === performance.employeeId);
                    return (
                      <div key={performance.id} className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900">{employee?.name || 'غير معروف'}</h3>
                            <p className="text-sm text-gray-600">{performance.period}</p>
                          </div>
                          <RatingStars rating={performance.rating} />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">الأهداف:</h4>
                            <p className="text-sm text-gray-600">{performance.goals}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">الإنجازات:</h4>
                            <p className="text-sm text-gray-600">{performance.achievements}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">ملاحظات:</h4>
                            <p className="text-sm text-gray-600">{performance.notes}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <button
                    onClick={() => exportData('employees')}
                    className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all text-center"
                  >
                    <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">تقرير الموظفين</h3>
                    <p className="text-sm text-gray-600">تصدير بيانات جميع الموظفين</p>
                  </button>

                  <button
                    onClick={() => exportData('attendance')}
                    className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all text-center"
                  >
                    <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">تقرير الحضور</h3>
                    <p className="text-sm text-gray-600">تصدير سجل الحضور والانصراف</p>
                  </button>

                  <button
                    onClick={() => exportData('leaves')}
                    className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all text-center"
                  >
                    <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">تقرير الإجازات</h3>
                    <p className="text-sm text-gray-600">تصدير بيانات الإجازات</p>
                  </button>

                  <button
                    onClick={() => exportData('payroll')}
                    className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all text-center"
                  >
                    <DollarSign className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">تقرير الرواتب</h3>
                    <p className="text-sm text-gray-600">تصدير كشف الرواتب</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddEmployee(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-4xl w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">إضافة موظف جديد</h3>

              <form onSubmit={handleAddEmployee} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المنصب</label>
                    <input
                      type="text"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">القسم</label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    >
                      <option value="">اختر القسم</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الراتب</label>
                    <input
                      type="number"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ التوظيف</label>
                    <input
                      type="date"
                      value={newEmployee.hireDate}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, hireDate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المهارات (مفصولة بفاصلة)</label>
                    <input
                      type="text"
                      value={newEmployee.skills}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, skills: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="React, Node.js, TypeScript"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">جهة الاتصال في حالات الطوارئ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                      <input
                        type="text"
                        value={newEmployee.emergencyContactName}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={newEmployee.emergencyContactPhone}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">صلة القرابة</label>
                      <input
                        type="text"
                        value={newEmployee.emergencyContactRelationship}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setShowAddEmployee(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                  >
                    إضافة الموظف
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEmployeeDetails(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-4xl w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">تفاصيل الموظف</h3>
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">المعلومات الشخصية</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-medium text-gray-900">{selectedEmployee.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">البريد الإلكتروني:</span>
                      <span className="text-gray-900">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الهاتف:</span>
                      <span className="text-gray-900">{selectedEmployee.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المنصب:</span>
                      <span className="text-gray-900">{selectedEmployee.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">القسم:</span>
                      <span className="text-gray-900">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الراتب:</span>
                      <span className="font-bold text-gray-900">{selectedEmployee.salary.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ التوظيف:</span>
                      <span className="text-gray-900">{new Date(selectedEmployee.hireDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">معلومات إضافية</h4>
                  <div className="space-y-4">
                    {selectedEmployee.emergencyContact && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">جهة الاتصال في الطوارئ:</h5>
                        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">الاسم:</span>
                            <span className="text-gray-900">{selectedEmployee.emergencyContact.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الهاتف:</span>
                            <span className="text-gray-900">{selectedEmployee.emergencyContact.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">صلة القرابة:</span>
                            <span className="text-gray-900">{selectedEmployee.emergencyContact.relationship}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">المهارات:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployee.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEmployee.deductions && selectedEmployee.deductions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">الخصومات:</h5>
                        <div className="space-y-2">
                          {selectedEmployee.deductions.map((deduction, index) => (
                            <div key={index} className="bg-red-50 rounded-xl p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-red-800 font-medium">{deduction.amount} ر.س</span>
                                <span className="text-red-600 text-sm">{deduction.type}</span>
                              </div>
                              <p className="text-red-700 text-sm mt-1">{deduction.reason}</p>
                              <p className="text-red-500 text-xs">{new Date(deduction.date).toLocaleDateString('ar-EG')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAttendanceModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">تسجيل حضور وانصراف</h3>

              <form onSubmit={handleAddAttendance} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموظف</label>
                  <select
                    value={newAttendance.employeeId}
                    onChange={(e) => setNewAttendance(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    required
                  >
                    <option value="">اختر الموظف</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                    <input
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                    <select
                      value={newAttendance.status}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, status: e.target.value as 'present' | 'late' | 'absent' }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="present">حاضر</option>
                      <option value="late">متأخر</option>
                      <option value="absent">غائب</option>
                      <option value="half-day">نصف يوم</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وقت الحضور</label>
                    <input
                      type="time"
                      value={newAttendance.checkIn}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وقت الانصراف</label>
                    <input
                      type="time"
                      value={newAttendance.checkOut}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                  >
                    تسجيل الحضور
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLeaveModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">طلب إجازة</h3>

              <form onSubmit={handleAddLeave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموظف</label>
                  <select
                    value={newLeave.employeeId}
                    onChange={(e) => setNewLeave(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    required
                  >
                    <option value="">اختر الموظف</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع الإجازة</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave(prev => ({ ...prev, type: e.target.value as 'annual' | 'sick' | 'emergency' | 'maternity' | 'unpaid' }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="annual">إجازة سنوية</option>
                    <option value="sick">إجازة مرضية</option>
                    <option value="emergency">إجازة طارئة</option>
                    <option value="maternity">إجازة أمومة</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                    <input
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                    <input
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السبب</label>
                  <textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                  >
                    إرسال الطلب
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPerformanceModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                تقييم الأداء {selectedEmployee ? `- ${selectedEmployee.name}` : ''}
              </h3>

              <form onSubmit={handleAddPerformance} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموظف</label>
                  <select
                    value={newPerformance.employeeId}
                    onChange={(e) => setNewPerformance(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    required
                  >
                    <option value="">اختر الموظف</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الفترة</label>
                    <input
                      type="text"
                      value={newPerformance.period}
                      onChange={(e) => setNewPerformance(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="2024-Q1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التقييم (1-5)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={newPerformance.rating}
                        onChange={(e) => setNewPerformance(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <div className="flex items-center space-x-1">
                        <RatingStars rating={newPerformance.rating} />
                        <span className="text-sm font-medium text-gray-900 mr-2">{newPerformance.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الأهداف</label>
                  <textarea
                    value={newPerformance.goals}
                    onChange={(e) => setNewPerformance(prev => ({ ...prev, goals: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الإنجازات</label>
                  <textarea
                    value={newPerformance.achievements}
                    onChange={(e) => setNewPerformance(prev => ({ ...prev, achievements: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                  <textarea
                    value={newPerformance.notes}
                    onChange={(e) => setNewPerformance(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setShowPerformanceModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                  >
                    حفظ التقييم
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deduction Modal */}
      {showDeductionModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeductionModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                إضافة خصم - {selectedEmployee.name}
              </h3>

              <form onSubmit={handleAddDeduction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الخصم</label>
                    <select
                      value={newDeduction.type}
                      onChange={(e) => setNewDeduction(prev => ({ ...prev, type: e.target.value as 'absence' | 'late' | 'violation' | 'loan' | 'other' }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="absence">غياب</option>
                      <option value="late">تأخير</option>
                      <option value="violation">مخالفة</option>
                      <option value="loan">قرض</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ (ر.س)</label>
                    <input
                      type="number"
                      value={newDeduction.amount}
                      onChange={(e) => setNewDeduction(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السبب</label>
                  <textarea
                    value={newDeduction.reason}
                    onChange={(e) => setNewDeduction(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setShowDeductionModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-colors"
                  >
                    إضافة الخصم
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;