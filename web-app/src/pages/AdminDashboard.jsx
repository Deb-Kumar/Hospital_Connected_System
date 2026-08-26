import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import FormattedArticleContent from '../components/FormattedArticleContent';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, RefreshCw, ChevronLeft, ChevronRight, Menu,
  LayoutDashboard, Clock, Building2, Stethoscope, Users,
  UserCheck, Calendar, MessageSquare, ShieldCheck, Megaphone,
  Settings, Shield, Palmtree, KeyRound
} from 'lucide-react';
import OpdSchedulePicker from '../components/Appointment/OpdSchedulePicker';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sidebar Navigation State: 'overview' | 'pending' | 'departments' | 'doctors' | 'patients' | 'staff' | 'appointments'
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  // Directory Data Lists & Patient Filters
  const [listData, setListData] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientGenderFilter, setPatientGenderFilter] = useState('ALL');
  const [patientDeptFilter, setPatientDeptFilter] = useState('ALL');
  const [deptStatusFilter, setDeptStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DEACTIVE'
  const [doctorDeptFilter, setDoctorDeptFilter] = useState('ALL');

  // Modals & Custom Popups
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deletingDept, setDeletingDept] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deletingDoctor, setDeletingDoctor] = useState(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [rbacStaff, setRbacStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [notifyPopup, setNotifyPopup] = useState(null);
  const [approvalSubTab, setApprovalSubTab] = useState('doctors'); // 'doctors' | 'staff'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Advanced System Control Module States
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const [revenueData, setRevenueData] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', message: '', type: 'ANNOUNCEMENT' });

  // Blog Management
  const [allBlogs, setAllBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deletingBlog, setDeletingBlog] = useState(null);
  const [viewingBlog, setViewingBlog] = useState(null);
  const [reviewingBlog, setReviewingBlog] = useState(null);
  const [blogStatusFilter, setBlogStatusFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'DRAFT'
  const [blogForm, setBlogForm] = useState({ title: '', category: 'General Health', desc: '', author: '', role: '', image: '', fullText: '', status: 'PUBLISHED', showOnHome: false });

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingMedical, setLoadingMedical] = useState(false);
  const [medicalSubTab, setMedicalSubTab] = useState('prescriptions');

  const [settingsData, setSettingsData] = useState({
    hospitalName: 'Brainware Medical College & Hospital',
    emergencyHotline: '+91 1800-123-4567',
    supportEmail: 'support@brainwarehospital.com',
    opdOpeningTime: '08:00 AM',
    opdClosingTime: '08:00 PM',
    slotDurationMinutes: 30,
    autoApproveDoctors: false,
    autoApproveStaff: false,
    maintenanceMode: false,
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showEditSettingsModal, setShowEditSettingsModal] = useState(false);
  const [editSettingsForm, setEditSettingsForm] = useState({});

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark');
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Patient Inquiries Module States
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);

  // Inquiry Delete Confirmation Modal States
  const [deletingInquiry, setDeletingInquiry] = useState(null);
  const [isDeletingAllInquiries, setIsDeletingAllInquiries] = useState(false);
  const [deletingInquiryProcess, setDeletingInquiryProcess] = useState(false);

  async function fetchInquiries() {
    setLoadingInquiries(true);
    try {
      const res = await axiosClient.get('/inquiries');
      setInquiries(res.data || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  }

  // Leave Management States
  const [leavesData, setLeavesData] = useState({
    pendingRequests: [],
    approvedRequests: [],
    rejectedRequests: [],
    allRequests: [],
    doctorsOnLeave: [],
    staffOnLeave: [],
    allDoctors: [],
    allStaff: [],
    pendingCount: 0,
    totalOnLeave: 0
  });
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leaveTab, setLeaveTab] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'DIRECTORY'
  const [showGrantLeaveModal, setShowGrantLeaveModal] = useState(false);
  const [grantLeaveUserType, setGrantLeaveUserType] = useState('DOCTOR');
  const [grantLeaveUserId, setGrantLeaveUserId] = useState('');
  const [grantLeaveReason, setGrantLeaveReason] = useState('');
  const [savingLeaveToggle, setSavingLeaveToggle] = useState(false);

  async function fetchLeavesData() {
    setLoadingLeaves(true);
    try {
      const res = await axiosClient.get('/admin/leaves');
      if (res.data?.success) {
        setLeavesData({
          pendingRequests: res.data.pendingRequests || [],
          approvedRequests: res.data.approvedRequests || [],
          rejectedRequests: res.data.rejectedRequests || [],
          allRequests: res.data.allRequests || [],
          doctorsOnLeave: res.data.doctorsOnLeave || [],
          staffOnLeave: res.data.staffOnLeave || [],
          allDoctors: res.data.allDoctors || [],
          allStaff: res.data.allStaff || [],
          pendingCount: res.data.pendingCount || 0,
          totalOnLeave: res.data.totalOnLeave || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch leave data:', err);
    } finally {
      setLoadingLeaves(false);
    }
  }

  async function handleApproveLeaveRequest(requestId) {
    try {
      await axiosClient.put(`/admin/leaves/${requestId}/approve`, { adminComment: 'Approved by Administrator' });
      showNotify('success', 'Leave Approved', 'Leave application has been approved successfully.');
      fetchLeavesData();
    } catch (err) {
      showNotify('error', 'Approval Failed', err.response?.data?.message || 'Failed to approve leave.');
    }
  }

  async function handleRejectLeaveRequest(requestId) {
    const inputReason = window.prompt('Please enter the reason for rejecting this leave application:');
    if (inputReason === null) return;
    const rejectionReason = inputReason.trim() || 'Leave request denied due to department operational requirements.';

    try {
      await axiosClient.put(`/admin/leaves/${requestId}/reject`, {
        adminComment: rejectionReason,
        rejectionReason: rejectionReason,
      });
      showNotify('success', 'Leave Rejected', 'Leave application rejected with reason.');
      fetchLeavesData();
    } catch (err) {
      showNotify('error', 'Rejection Failed', err.response?.data?.message || 'Failed to reject leave.');
    }
  }

  async function handleRevokeLeaveRequest(requestId) {
    try {
      await axiosClient.put(`/admin/leaves/${requestId}/revoke`);
      showNotify('success', 'Leave Revoked', 'Leave has been revoked and personnel status reset to ON DUTY.');
      fetchLeavesData();
    } catch (err) {
      showNotify('error', 'Revoke Failed', err.response?.data?.message || 'Failed to revoke leave.');
    }
  }

  async function handleToggleAdminLeave(userId, userType, onLeave, reason = '') {
    try {
      await axiosClient.put('/admin/leaves/toggle', { userId, userType, onLeave, reason });
      showNotify('success', 'Leave Status Updated', `Leave status updated for ${userType.toLowerCase()} personnel.`);
      fetchLeavesData();
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to update leave status.');
    }
  }

  async function handleAdminGrantLeaveSubmit(e) {
    e.preventDefault();
    if (!grantLeaveUserId) return;
    setSavingLeaveToggle(true);
    try {
      await axiosClient.put('/admin/leaves/toggle', {
        userId: grantLeaveUserId,
        userType: grantLeaveUserType,
        onLeave: true,
        reason: grantLeaveReason || 'Absence granted by Admin'
      });
      showNotify('success', 'Leave Granted', 'Leave has been granted to personnel successfully.');
      setShowGrantLeaveModal(false);
      setGrantLeaveUserId('');
      setGrantLeaveReason('');
      fetchLeavesData();
    } catch (err) {
      showNotify('error', 'Grant Leave Failed', err.response?.data?.message || 'Failed to grant leave.');
    } finally {
      setSavingLeaveToggle(false);
    }
  }

  async function handleUpdateInquiryStatus(id, newStatus) {
    setUpdatingInquiryId(id);
    try {
      await axiosClient.put(`/inquiries/${id}/status`, { status: newStatus });
      showNotify('success', 'Status Updated', `Inquiry status updated to "${newStatus.replace('_', ' ')}"`);
      fetchInquiries();
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to update inquiry status.');
    } finally {
      setUpdatingInquiryId(null);
    }
  }

  async function confirmDeleteSingleInquiry() {
    if (!deletingInquiry) return;
    setDeletingInquiryProcess(true);
    try {
      await axiosClient.delete(`/inquiries/${deletingInquiry._id}`);
      showNotify('success', 'Ticket Deleted', 'Patient inquiry ticket deleted successfully.');
      fetchInquiries();
      if (selectedInquiry && selectedInquiry._id === deletingInquiry._id) {
        setSelectedInquiry(null);
      }
      setDeletingInquiry(null);
    } catch (err) {
      showNotify('error', 'Delete Failed', 'Failed to delete inquiry ticket.');
    } finally {
      setDeletingInquiryProcess(false);
    }
  }

  async function confirmDeleteAllInquiries() {
    setDeletingInquiryProcess(true);
    try {
      await axiosClient.delete('/inquiries/all');
      showNotify('success', 'All Inquiries Deleted', 'All patient inquiry tickets have been cleared.');
      fetchInquiries();
      setSelectedInquiry(null);
      setIsDeletingAllInquiries(false);
    } catch (err) {
      showNotify('error', 'Delete Failed', err.response?.data?.message || 'Failed to delete all inquiries.');
    } finally {
      setDeletingInquiryProcess(false);
    }
  }

  async function toggleDepartmentActive(dept) {
    const newActive = dept.active === false ? true : false;
    try {
      await axiosClient.put(`/admin/departments/${dept._id}`, { active: newActive });
      showNotify(
        'success',
        'Department Status Updated',
        `"${dept.name}" has been ${newActive ? 'activated and is now visible to patients' : 'deactivated and hidden from public view'}.`
      );
      try {
        localStorage.setItem('department_fee_changed', `${dept._id}_${Date.now()}`);
        window.dispatchEvent(new CustomEvent('department_fee_changed'));
      } catch (e) {}
      loadDirectory('/admin/departments');
    } catch (err) {
      showNotify('error', 'Status Update Failed', err.response?.data?.message || 'Failed to update department status.');
    }
  }

  function showNotify(type, title, message) {
    setNotifyPopup({ type, title, message });
  }

  useEffect(() => {
    fetchStats();
    loadPending();
    axiosClient.get('/admin/doctors').then((res) => setAllDoctors(res.data || [])).catch(() => {});
    axiosClient.get('/admin/appointments').then((res) => setAllAppointments(res.data || [])).catch(() => {});
    fetchInquiries();
    fetchLeavesData();
  }, []);

  useEffect(() => {
    setDeptStatusFilter('ALL');
    setDoctorDeptFilter('ALL');
    if (activeNav === 'doctors') loadDirectory('/admin/doctors');
    else if (activeNav === 'patients') loadDirectory('/admin/patients');
    else if (activeNav === 'staff') loadDirectory('/admin/receptionists');
    else if (activeNav === 'departments') loadDirectory('/admin/departments');
    else if (activeNav === 'appointments') loadDirectory('/admin/appointments');
    else if (activeNav === 'inquiries') fetchInquiries();
    else if (activeNav === 'leaves') fetchLeavesData();
    else if (activeNav === 'security') fetchSecurityLogs();
    else if (activeNav === 'revenue') fetchRevenueData();
    else if (activeNav === 'notices') { fetchNotices(); fetchBlogs(); }
    else if (activeNav === 'medical-audit') fetchMedicalAudit();
    else if (activeNav === 'settings') fetchSettings();
  }, [activeNav]);

  function handleGlobalRefresh() {
    setRefreshing(true);
    fetchStats();
    loadPending();
    fetchLeavesData();
    if (activeNav === 'doctors') loadDirectory('/admin/doctors');
    else if (activeNav === 'patients') loadDirectory('/admin/patients');
    else if (activeNav === 'staff') loadDirectory('/admin/receptionists');
    else if (activeNav === 'departments') loadDirectory('/admin/departments');
    else if (activeNav === 'appointments') loadDirectory('/admin/appointments');
    else if (activeNav === 'inquiries') fetchInquiries();
    else if (activeNav === 'leaves') fetchLeavesData();
    else if (activeNav === 'security') fetchSecurityLogs();
    else if (activeNav === 'revenue') fetchRevenueData();
    else if (activeNav === 'notices') { fetchNotices(); fetchBlogs(); }
    else if (activeNav === 'medical-audit') fetchMedicalAudit();
    else if (activeNav === 'settings') fetchSettings();
    showNotify('success', 'Data Refreshed', 'Admin panel data has been refreshed successfully.');
    setTimeout(() => setRefreshing(false), 600);
  }

  const [auditRoleFilter, setAuditRoleFilter] = useState('ALL');
  const [auditEventFilter, setAuditEventFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [showDeleteAuditModal, setShowDeleteAuditModal] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState(null);
  const [adminDeletePwd, setAdminDeletePwd] = useState('');
  const [pwdDeleteError, setPwdDeleteError] = useState('');
  const [deletingAudit, setDeletingAudit] = useState(false);

  useEffect(() => {
    if (activeNav === 'security') {
      fetchSecurityLogs();
    }
  }, [activeNav, auditRoleFilter, auditEventFilter, auditSearch]);

  async function fetchSecurityLogs() {
    setLoadingSecurity(true);
    try {
      const params = new URLSearchParams();
      if (auditRoleFilter && auditRoleFilter !== 'ALL') params.append('role', auditRoleFilter);
      if (auditEventFilter && auditEventFilter !== 'ALL') params.append('actionType', auditEventFilter);
      if (auditSearch.trim()) params.append('search', auditSearch.trim());

      const res = await axiosClient.get(`/admin/security/login-history?${params.toString()}`);
      setSecurityLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSecurity(false);
    }
  }

  async function handleConfirmDeleteAuditLog() {
    if (!adminDeletePwd) {
      setPwdDeleteError('Admin password is required.');
      return;
    }
    setDeletingAudit(true);
    setPwdDeleteError('');
    try {
      const res = await axiosClient.delete('/admin/security/audit-logs', {
        data: {
          password: adminDeletePwd,
          logId: deletingLogId !== 'ALL' ? deletingLogId : undefined,
          clearAll: deletingLogId === 'ALL',
        },
      });
      showNotify('success', 'Audit Logs Updated', res.data.message);
      setShowDeleteAuditModal(false);
      setDeletingLogId(null);
      setAdminDeletePwd('');
      fetchSecurityLogs();
    } catch (err) {
      setPwdDeleteError(err.response?.data?.message || 'Invalid admin password. Authorization failed.');
    } finally {
      setDeletingAudit(false);
    }
  }

  async function fetchRevenueData() {
    setLoadingRevenue(true);
    try {
      const res = await axiosClient.get('/admin/reports/revenue');
      setRevenueData(res.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRevenue(false);
    }
  }

  async function fetchNotices() {
    setLoadingNotices(true);
    try {
      const res = await axiosClient.get('/admin/notices');
      setNotices(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotices(false);
    }
  }

  async function handleCreateNotice(e) {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/notices', newNotice);
      showNotify('success', 'Notice Broadcasted', 'New hospital announcement published successfully.');
      setShowNoticeModal(false);
      setNewNotice({ title: '', message: '', type: 'ANNOUNCEMENT' });
      fetchNotices();
    } catch (err) {
      showNotify('error', 'Publish Failed', err.response?.data?.message || err.message);
    }
  }

  async function handleToggleNotice(id) {
    try {
      await axiosClient.put(`/admin/notices/${id}/toggle`);
      fetchNotices();
    } catch (err) {
      showNotify('error', 'Action Failed', err.message);
    }
  }

  async function handleDeleteNotice(id) {
    try {
      await axiosClient.delete(`/admin/notices/${id}`);
      showNotify('success', 'Notice Deleted', 'Broadcast notice removed successfully.');
      fetchNotices();
    } catch (err) {
      showNotify('error', 'Action Failed', err.message);
    }
  }

  // Blog Management Functions
  async function fetchBlogs() {
    setLoadingBlogs(true);
    try {
      const res = await axiosClient.get('/blogs/admin/all');
      setAllBlogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoadingBlogs(false);
    }
  }

  function openAddBlog() {
    setEditingBlog(null);
    setBlogForm({ title: '', category: 'General Health', desc: '', author: '', role: '', image: '', fullText: '', status: 'PUBLISHED', showOnHome: false });
    setShowBlogModal(true);
  }

  function openEditBlog(blog) {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title || '',
      category: blog.category || 'General Health',
      desc: blog.desc || '',
      author: blog.author || '',
      role: blog.role || '',

      image: blog.image || '',
      fullText: blog.fullText || '',
      status: blog.status || 'PUBLISHED',
      showOnHome: blog.showOnHome || false,
    });
    setShowBlogModal(true);
  }

  async function handleSaveBlog(e) {
    e.preventDefault();
    try {
      if (editingBlog) {
        await axiosClient.put(`/blogs/${editingBlog._id}`, blogForm);
        showNotify('success', 'Blog Updated', `Blog article "${blogForm.title}" has been updated.`);
      } else {
        await axiosClient.post('/blogs', blogForm);
        showNotify('success', 'Blog Published', `Blog article "${blogForm.title}" created successfully.`);
      }
      setShowBlogModal(false);
      setEditingBlog(null);
      fetchBlogs();
    } catch (err) {
      showNotify('error', 'Blog Save Failed', err.response?.data?.message || err.message);
    }
  }

  async function handleDeleteBlog(id) {
    try {
      await axiosClient.delete(`/blogs/${id}`);
      showNotify('success', 'Blog Deleted', 'Blog article permanently removed from database.');
      setDeletingBlog(null);
      fetchBlogs();
    } catch (err) {
      showNotify('error', 'Delete Failed', err.response?.data?.message || err.message);
    }
  }

  async function handleToggleBlogHome(blogId) {
    try {
      const res = await axiosClient.put(`/blogs/${blogId}/toggle-home`);
      showNotify('success', 'Home Page Updated', res.data?.message || 'Blog home visibility toggled.');
      fetchBlogs();
    } catch (err) {
      showNotify('error', 'Toggle Failed', err.response?.data?.message || err.message);
    }
  }

  async function handleReviewBlog(blogId, status, payload = {}) {
    let rejectionReason = typeof payload === 'string' ? payload : (payload.rejectionReason || '');
    if (status === 'REJECTED' && !rejectionReason) {
      const input = window.prompt('Please enter the reason for rejecting this doctor blog submission:');
      if (input === null) return;
      rejectionReason = input.trim() || 'Content did not meet hospital editorial standards.';
    }

    try {
      const reviewData = typeof payload === 'object' ? { status, rejectionReason, ...payload } : { status, rejectionReason };
      try {
        await axiosClient.put(`/blogs/${blogId}/review`, reviewData);
      } catch (putErr) {
        if (putErr.response?.status === 404) {
          // Fallback to standard /blogs/:id if /blogs/:id/review is 404
          await axiosClient.put(`/blogs/${blogId}`, reviewData);
        } else {
          throw putErr;
        }
      }
      showNotify('success', status === 'PUBLISHED' ? 'Blog Published' : 'Blog Rejected', 'Blog status updated successfully.');
      fetchBlogs();
      setReviewingBlog(null);
    } catch (err) {
      showNotify('error', 'Review Action Failed', err.response?.data?.message || err.message);
    }
  }

  async function fetchSettings() {
    setLoadingSettings(true);
    try {
      const res = await axiosClient.get('/admin/settings');
      if (res.data) setSettingsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSettings(false);
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await axiosClient.put('/admin/settings', settingsData);
      showNotify('success', 'Settings Saved', 'Global system settings updated successfully.');
    } catch (err) {
      showNotify('error', 'Save Failed', err.response?.data?.message || err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveSettingsModal(e) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await axiosClient.put('/admin/settings', editSettingsForm);
      setSettingsData({ ...editSettingsForm });
      showNotify('success', 'Configurations Updated', 'Global hospital configurations updated successfully.');
      setShowEditSettingsModal(false);
    } catch (err) {
      showNotify('error', 'Save Failed', err.response?.data?.message || err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  async function fetchMedicalAudit() {
    setLoadingMedical(true);
    try {
      const [recsRes, prescsRes] = await Promise.all([
        axiosClient.get('/admin/medical-records'),
        axiosClient.get('/admin/prescriptions'),
      ]);
      setMedicalRecords(recsRes.data || []);
      setPrescriptions(prescsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMedical(false);
    }
  }

  function fetchStats() {
    axiosClient.get('/admin/dashboard').then((res) => setStats(res.data)).catch(() => {});
    axiosClient.get('/admin/doctors').then((res) => setAllDoctors(res.data || [])).catch(() => {});
    axiosClient.get('/admin/appointments').then((res) => setAllAppointments(res.data || [])).catch(() => {});
    axiosClient.get('/admin/departments').then((res) => setAllDepartments(res.data || [])).catch(() => {});
  }

  function loadPending() {
    setLoadingPending(true);
    Promise.all([
      axiosClient.get('/admin/doctors/pending').catch(() => ({ data: [] })),
      axiosClient.get('/admin/staff/pending').catch(() => ({ data: [] })),
    ]).then(([docRes, staffRes]) => {
      setPendingDoctors(docRes.data || []);
      setPendingStaff(staffRes.data || []);
    }).finally(() => setLoadingPending(false));
  }

  function loadDirectory(endpoint) {
    setLoadingList(true);
    setSearchTerm('');
    axiosClient.get('/admin/doctors').then((res) => setAllDoctors(res.data || [])).catch(() => {});
    axiosClient.get('/admin/appointments').then((res) => setAllAppointments(res.data || [])).catch(() => {});
    axiosClient.get(endpoint)
      .then((res) => {
        const data = res.data || [];
        setListData(data);
        if (endpoint.includes('departments')) {
          setAllDepartments(data);
        }
      })
      .catch(() => setListData([]))
      .finally(() => setLoadingList(false));
  }

  async function handleToggleUserStatus(userObj, directoryType = 'doctors') {
    if (!userObj) return;
    const userId = typeof userObj === 'string' ? userObj : userObj._id;
    if (!userId) return;

    let isCurrentlyActive = true;
    if (typeof userObj === 'object' && userObj.active !== undefined) {
      isCurrentlyActive = userObj.active !== false;
    }

    const endpoint = `/admin/users/${userId}/${isCurrentlyActive ? 'deactivate' : 'activate'}`;
    try {
      await axiosClient.put(endpoint);
      showNotify(
        'success',
        'Status Updated',
        `User login ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully.`
      );
      if (directoryType === 'doctors' || activeNav === 'doctors') {
        loadDirectory('/admin/doctors');
      } else if (directoryType === 'staff' || activeNav === 'staff') {
        loadDirectory('/admin/receptionists');
      } else if (directoryType === 'patients' || activeNav === 'patients') {
        loadDirectory('/admin/patients');
      }
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to update user status.');
    }
  }

  async function handleToggleStaffActive(userObj) {
    return handleToggleUserStatus(userObj, 'staff');
  }

  const [approvingItem, setApprovingItem] = useState(null);

  function handleApproveDoctor(doctor) {
    setApprovingItem({ item: doctor, type: 'doctor' });
  }

  function handleRejectDoctor(doctor) {
    setRejectingItem({ item: doctor, type: 'doctor' });
  }

  function handleApproveStaff(staff) {
    setApprovingItem({ item: staff, type: 'staff' });
  }

  function handleRejectStaff(staff) {
    setRejectingItem({ item: staff, type: 'staff' });
  }

  async function executeApproval() {
    if (!approvingItem) return;
    const { item, type } = approvingItem;
    const endpoint = type === 'doctor' ? `/admin/doctors/${item._id}/approve` : `/admin/staff/${item._id}/approve`;
    try {
      await axiosClient.put(endpoint);
      showNotify(
        'success',
        `${type === 'doctor' ? 'Doctor' : 'Staff'} Approved`,
        `${type === 'doctor' ? 'Dr. ' + (item.user?.fullName || item.fullName || '') : (item.user?.fullName || item.fullName || 'Staff Member')} account activated successfully.`
      );
      loadPending();
      fetchStats();
      if (activeNav === 'doctors') loadDirectory('/admin/doctors');
      if (activeNav === 'staff') loadDirectory('/admin/receptionists');
    } catch {
      showNotify('error', 'Approval Failed', `Failed to approve ${type} application.`);
    } finally {
      setApprovingItem(null);
    }
  }

  async function executeRejection(reason) {
    if (!rejectingItem) return;
    const { item, type } = rejectingItem;
    const endpoint = type === 'doctor' ? `/admin/doctors/${item._id}/reject` : `/admin/staff/${item._id}/reject`;
    try {
      await axiosClient.put(endpoint, { reason });
      showNotify('success', 'Application Rejected', `${type === 'doctor' ? 'Doctor' : 'Staff'} application has been rejected.`);
      loadPending();
      fetchStats();
      if (activeNav === 'doctors') loadDirectory('/admin/doctors');
      if (activeNav === 'staff') loadDirectory('/admin/receptionists');
    } catch {
      showNotify('error', 'Rejection Failed', `Failed to reject ${type} application.`);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const totalPendingCount = pendingDoctors.length + pendingStaff.length;

  // Filter list data
  const filteredList = listData.filter((item) => {
    const term = searchTerm.toLowerCase();

    if (activeNav === 'patients') {
      // 1. Search term match
      let matchesSearch = true;
      if (term) {
        matchesSearch = (
          item.user?.fullName?.toLowerCase().includes(term) ||
          item.user?.phone?.includes(term) ||
          item.user?.email?.toLowerCase().includes(term) ||
          item.bloodGroup?.toLowerCase().includes(term) ||
          item.address?.toLowerCase().includes(term)
        );
      }
      if (!matchesSearch) return false;

      // 2. Gender filter
      if (patientGenderFilter !== 'ALL') {
        const itemGender = (item.gender || 'Male').toUpperCase();
        if (itemGender !== patientGenderFilter) return false;
      }

      // 3. Department filter
      if (patientDeptFilter !== 'ALL') {
        const patientAppts = allAppointments.filter(
          (a) =>
            (a.patient?._id && a.patient._id === item._id) ||
            (a.patient?.user?._id && item.user?._id && a.patient.user._id === item.user._id) ||
            (a.patient?.user?.email && item.user?.email && a.patient.user.email === item.user.email)
        );
        const itemDept =
          patientAppts[0]?.doctor?.department?.name ||
          patientAppts[0]?.doctor?.specialization ||
          item.department?.name ||
          'General Medicine';

        if (itemDept.toLowerCase().trim() !== patientDeptFilter.toLowerCase().trim()) {
          return false;
        }
      }

      return true;
    }

    if (activeNav === 'departments') {
      const matchesSearch = !term || item.name?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
      if (deptStatusFilter === 'ACTIVE') return item.active !== false;
      if (deptStatusFilter === 'DEACTIVE') return item.active === false;
      return true;
    }

    if (activeNav === 'doctors') {
      let matchesSearch = true;
      if (term) {
        matchesSearch = (
          item.user?.fullName?.toLowerCase().includes(term) ||
          item.fullName?.toLowerCase().includes(term) ||
          item.specialization?.toLowerCase().includes(term) ||
          item.user?.email?.toLowerCase().includes(term)
        );
      }
      if (!matchesSearch) return false;

      if (doctorDeptFilter !== 'ALL') {
        const docDeptName = (item.department?.name || item.specialization || '').toLowerCase().trim();
        const filterName = doctorDeptFilter.toLowerCase().trim();
        const itemDeptId = (item.department?._id || item.department || '').toString();
        const isIdMatch = itemDeptId && itemDeptId === doctorDeptFilter;
        const isNameMatch = docDeptName === filterName || docDeptName.includes(filterName) || filterName.includes(docDeptName);

        if (!isIdMatch && !isNameMatch) return false;
      }

      return true;
    }

    if (!searchTerm) return true;
    if (activeNav === 'staff') {
      return (
        item.user?.fullName?.toLowerCase().includes(term) ||
        item.user?.phone?.includes(term) ||
        item.user?.email?.toLowerCase().includes(term)
      );
    }
    if (activeNav === 'appointments') {
      return (
        item.patient?.user?.fullName?.toLowerCase().includes(term) ||
        item.doctor?.user?.fullName?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-softBg dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden animate-fadeIn"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* LEFT SIDEBAR NAVBAR */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen flex-shrink-0 bg-darkNavy text-slate-300 flex flex-col justify-between border-r border-slate-800/60 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Top Brand Logo Header */}
          <div className="h-16 px-2 border-b border-slate-800/80 flex items-center justify-between gap-1 overflow-hidden">
            {isSidebarCollapsed ? (
              <div className="w-10 h-10 bg-white p-1 rounded-xl shadow-sm flex items-center justify-center shrink-0 mx-auto">
                <img
                  src="/hospital_logo.png"
                  alt="Brainware Logo"
                  className="h-6 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="flex-1 min-w-0 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center">
                <img
                  src="/hospital_logo.png"
                  alt="Brainware Medical College & Hospital"
                  className="h-7 w-auto object-contain max-w-[140px]"
                />
              </div>
            )}

            {/* Desktop Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex w-8 h-8 rounded-full bg-slate-800/90 hover:bg-indigo-600 text-slate-300 hover:text-white items-center justify-center border border-slate-700/80 shadow-md transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] text-xs font-bold">
            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Main Dashboard
                </p>
              )}
              <div className="space-y-1">
                <SidebarNavLink
                  icon={<LayoutDashboard size={18} />}
                  label="Overview"
                  active={activeNav === 'overview'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('overview'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Clock size={18} />}
                  label="Pending Approvals"
                  badge={totalPendingCount > 0 ? totalPendingCount : null}
                  badgeColor="bg-rose-500 text-white font-mono"
                  active={activeNav === 'pending'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('pending'); setIsMobileSidebarOpen(false); }}
                />
              </div>
            </div>

            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Hospital Management
                </p>
              )}
              <div className="space-y-1">
                <SidebarNavLink
                  icon={<Building2 size={18} />}
                  label="Departments"
                  active={activeNav === 'departments'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('departments'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Stethoscope size={18} />}
                  label="Doctors Directory"
                  active={activeNav === 'doctors'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('doctors'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Users size={18} />}
                  label="Patients Directory"
                  active={activeNav === 'patients'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('patients'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<UserCheck size={18} />}
                  label="Staff Members"
                  active={activeNav === 'staff'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('staff'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Calendar size={18} />}
                  label="Master Appointments"
                  active={activeNav === 'appointments'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('appointments'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<MessageSquare size={18} />}
                  label="Patient Inquiries"
                  badge={inquiries.filter((i) => i.status === 'NEW' || !i.status).length > 0 ? inquiries.filter((i) => i.status === 'NEW' || !i.status).length : null}
                  badgeColor="bg-amber-500 text-white font-mono font-black"
                  active={activeNav === 'inquiries'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('inquiries'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Palmtree size={18} />}
                  label="Leave Applications"
                  badge={leavesData.pendingCount > 0 ? `${leavesData.pendingCount} PENDING` : null}
                  badgeColor="bg-amber-500 text-white font-mono font-black"
                  active={activeNav === 'leaves'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('leaves'); setIsMobileSidebarOpen(false); }}
                />
              </div>
            </div>

            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  System Control & Audit
                </p>
              )}
              <div className="space-y-1">
                <SidebarNavLink
                  icon={<ShieldCheck size={18} />}
                  label="Security & Audit Logs"
                  active={activeNav === 'security'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('security'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Megaphone size={18} />}
                  label="System Broadcasts"
                  active={activeNav === 'notices'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('notices'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Settings size={18} />}
                  label="System Settings"
                  active={activeNav === 'settings'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('settings'); setIsMobileSidebarOpen(false); }}
                />
              </div>
            </div>
          </nav>
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <button
            type="button"
            onClick={() => { setActiveNav('admin-profile'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
              activeNav === 'admin-profile'
                ? 'bg-primary/20 border-primary/50 ring-1 ring-primary/30'
                : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80'
            }`}
            title={isSidebarCollapsed ? user?.fullName || 'Administrator' : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center text-xs border border-primary/30 shrink-0">
              🛡️
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden text-left min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
              </div>
            )}
          </button>

          {!isSidebarCollapsed && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
              title="Sign out of your administrator account"
            >
              <LogOut size={14} />
              <span>Sign Out Admin</span>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-darkNavy dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition cursor-pointer shrink-0 shadow-2xs"
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-poppins font-extrabold text-darkNavy dark:text-white text-xs sm:text-sm md:text-base lg:text-lg tracking-tight truncate min-w-0">
              {activeNav === 'overview' && '📊 Dashboard Overview'}
              {activeNav === 'pending' && '⚠️ Pending Account Verification Queue'}
              {activeNav === 'departments' && '🏬 Hospital Departments Directory'}
              {activeNav === 'doctors' && '🩺 Doctors Master Directory'}
              {activeNav === 'patients' && '👥 Patients Master Directory'}
              {activeNav === 'staff' && '📋 Hospital Staff Directory'}
              {activeNav === 'appointments' && '📅 Master Appointment Monitoring Log'}
              {activeNav === 'inquiries' && '💬 Patient Inquiries & Support Desk'}
              {activeNav === 'leaves' && '🏖️ Doctor & Staff Leave Applications & Absence Register'}
              {activeNav === 'security' && '🔐 Security & Audit Control Logs'}
              {activeNav === 'notices' && '📢 System Broadcasts & Notices'}
              {activeNav === 'medical-audit' && '📋 Medical History Audit Desk'}
              {activeNav === 'settings' && '⚙️ Global System Settings'}
              {activeNav === 'admin-profile' && '🛡️ Administrator Profile & Account Settings'}
            </h1>
          </div>

          {/* Right Header Widget Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={handleGlobalRefresh}
              title="Refresh All Panel Data"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700/80 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-white' : 'text-slate-300'} />
              <span className="font-extrabold text-white text-xs hidden xs:inline">Refresh Data</span>
            </button>
            <HeaderClockWidget />
            <ThemeToggleBtn isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <UserProfileBadgeWidget user={user} fallbackRole="ADMIN" onProfileClick={() => setActiveNav('admin-profile')} onLogout={() => setShowLogoutConfirm(true)} />
          </div>
        </header>

        {/* Main Content Pages */}
        <main className="p-4 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">

          {/* PAGE 1: OVERVIEW */}
          {activeNav === 'overview' && (
            <>
              {/* Banner with Crisp Contrast */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      System Operations Normal
                    </div>
                    <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
                      Brainware Hospital Control Center
                    </h2>
                    <p className="text-sm text-slate-200 mt-1.5 max-w-3xl font-medium leading-relaxed">
                      Live metrics, pending doctor & staff account reviews, and hospital department management.
                    </p>
                  </div>

                  <button
                    onClick={() => { fetchStats(); loadPending(); }}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl text-xs font-extrabold transition active:scale-95 text-white shadow-md self-start md:self-auto"
                  >
                    🔄 Refresh Live Stats
                  </button>
                </div>
              </div>

              {/* Stat Cards Grid (Includes Staff Members) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Patients" value={stats?.totalPatients} icon="👥" gradient="from-blue-500/10 to-blue-600/5" borderColor="border-blue-200" textColor="text-blue-700" badge="Registered" />
                <StatCard label="Total Doctors" value={stats?.totalDoctors} icon="🩺" gradient="from-emerald-500/10 to-emerald-600/5" borderColor="border-emerald-200" textColor="text-emerald-700" badge="Verified" />
                <StatCard label="Staff Members" value={stats?.totalStaff} icon="📋" gradient="from-purple-500/10 to-purple-600/5" borderColor="border-purple-200" textColor="text-purple-700" badge="Active Staff" />
                <StatCard label="Today's Appointments" value={stats?.todaysAppointments} icon="📅" gradient="from-indigo-500/10 to-indigo-600/5" borderColor="border-indigo-200" textColor="text-indigo-700" badge="Scheduled" />
              </div>

              {/* Pending Action Card */}
              {totalPendingCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <h3 className="font-bold text-amber-900 text-sm">
                        {totalPendingCount} Account Application{totalPendingCount > 1 ? 's' : ''} Awaiting Review
                      </h3>
                      <p className="text-xs text-amber-700">
                        {pendingDoctors.length} Doctor and {pendingStaff.length} Staff Member sign-ups are waiting for admin approval.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNav('pending')}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 self-start sm:self-auto"
                  >
                    Review Applications Now →
                  </button>
                </div>
              )}

              {/* Patient Appointment Bookings & Revenue Analytics Chart (Replaces Quick Operations Directory) */}
              <AnalyticsOverviewChart allAppointments={allAppointments} />
            </>
          )}

          {/* PAGE 2: PENDING APPROVALS */}
          {activeNav === 'pending' && (
            <div className="space-y-6">
              {/* Header Hero Card for Pending Approvals */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      ⏳ Account Verification & Approvals Master
                    </span>
                    <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                      Pending Account Approvals & Registrations
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium">
                      Review, verify qualifications, and approve incoming Doctor and Hospital Staff registration applications.
                    </p>
                  </div>

                  <button
                    onClick={loadPending}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700/80 px-4 py-2.5 rounded-full transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm self-start md:self-auto shrink-0"
                  >
                    <RefreshCw size={14} className={loadingPending ? 'animate-spin text-white' : 'text-slate-300'} />
                    <span>Refresh Pending</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 text-darkNavy dark:text-slate-100 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-lg">
                      Pending Account Verifications
                    </h2>
                    <p className="text-xs text-slateText dark:text-slate-400">Review and activate doctor and staff member accounts.</p>
                  </div>

                  <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                    <button
                      onClick={() => setApprovalSubTab('doctors')}
                      className={`px-3.5 py-1.5 rounded-lg transition ${
                        approvalSubTab === 'doctors' ? 'bg-white dark:bg-slate-700 text-primary dark:text-sky-300 shadow-xs' : 'text-slateText dark:text-slate-400'
                      }`}
                    >
                      🩺 Doctors ({pendingDoctors.length})
                    </button>
                    <button
                      onClick={() => setApprovalSubTab('staff')}
                      className={`px-3.5 py-1.5 rounded-lg transition ${
                        approvalSubTab === 'staff' ? 'bg-white dark:bg-slate-700 text-primary dark:text-sky-300 shadow-xs' : 'text-slateText dark:text-slate-400'
                      }`}
                    >
                      📋 Staff ({pendingStaff.length})
                    </button>
                  </div>
                </div>

                {loadingPending ? (
                  <div className="py-12 text-center text-xs text-slateText dark:text-slate-400">Loading pending applications...</div>
                ) : approvalSubTab === 'doctors' ? (
                  pendingDoctors.length === 0 ? (
                    <EmptyState icon="✅" message="No pending Doctor applications at this time." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {pendingDoctors.map((doc) => {
                        const rawAvatar = doc.profileImage || doc.avatarUrl || doc.user?.avatarUrl || doc.user?.profileImage || doc.user?.avatar || doc.user?.photoUrl;
                        const avatarUrl = rawAvatar ? (rawAvatar.startsWith('/uploads/') ? `http://localhost:5000${rawAvatar}` : rawAvatar) : '';
                        const docName = String(doc.user?.fullName || doc.fullName || 'Doctor').trim();
                        const displayName = /^dr\.?/i.test(docName) ? docName : `Dr. ${docName}`;

                        return (
                          <div key={doc._id} className="bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex items-center gap-3.5 min-w-0">
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={displayName}
                                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover object-top border-2 border-emerald-500/40 shadow-md shrink-0"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-primary text-white font-extrabold text-2xl flex items-center justify-center border-2 border-emerald-500/40 shadow-md shrink-0">
                                      🩺
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-base truncate">{displayName}</h3>
                                    <p className="text-xs font-mono text-slateText dark:text-slate-400 truncate">{doc.user?.email || doc.email}</p>
                                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{doc.user?.phone || doc.phone || 'Contact N/A'}</p>
                                  </div>
                                </div>

                                <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                                  DOCTOR PENDING
                                </span>
                              </div>

                              <div className="space-y-2 text-xs bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/70">
                                <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-[10px]">Specialization</span> <span className="font-extrabold text-darkNavy dark:text-white">{doc.specialization || doc.department?.name || 'General Medicine'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-[10px]">Clinical Experience</span> <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{doc.experienceYears || 0} Years</span></div>
                                <div className="pt-1 border-t border-slate-100 dark:border-slate-800"><span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Qualifications</span> <span className="font-extrabold text-darkNavy dark:text-white block">{doc.qualifications || doc.qualification || 'MBBS, MD'}</span></div>
                              </div>

                              {/* Bottom-Up OPD Schedule Banner */}
                              <div className="bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-emerald-500/10 border border-sky-500/30 dark:border-sky-400/30 rounded-xl p-3 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-300 flex items-center gap-1.5">
                                  <span>🕒</span> OPD Consultation Schedule:
                                </span>
                                <p className="font-mono font-extrabold text-xs text-darkNavy dark:text-white">
                                  {doc.availabilitySchedule || doc.opdTime || 'MON-FRI: 09:00 AM - 02:00 PM'}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2.5 pt-1">
                              <button
                                onClick={() => handleApproveDoctor(doc)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <span>✓</span> Approve Doctor
                              </button>
                              <button
                                onClick={() => handleRejectDoctor(doc)}
                                className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-extrabold py-2.5 rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <span>✕</span> Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  pendingStaff.length === 0 ? (
                    <EmptyState icon="✅" message="No pending Staff Member applications at this time." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {pendingStaff.map((staff) => (
                        <div key={staff._id} className="bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-base truncate">{staff.user?.fullName || staff.fullName}</h3>
                                <p className="text-xs font-mono text-slateText dark:text-slate-400 truncate">{staff.user?.email || staff.email}</p>
                                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{staff.user?.phone || staff.phone || 'Contact N/A'}</p>
                              </div>
                              <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                                STAFF PENDING
                              </span>
                            </div>

                            <div className="text-xs bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/70 space-y-1">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Role</span>
                              <span className="font-extrabold text-darkNavy dark:text-white block">Hospital Staff Member (Reception Desk)</span>
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-1">
                            <button
                              onClick={() => handleApproveStaff(staff)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>✓</span> Approve Staff
                            </button>
                            <button
                              onClick={() => handleRejectStaff(staff)}
                              className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-extrabold py-2.5 rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>✕</span> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* PAGE 3: DIRECTORY VIEWS (Departments, Doctors, Patients, Staff, Appointments) */}
          {activeNav !== 'overview' && activeNav !== 'pending' && activeNav !== 'inquiries' && activeNav !== 'leaves' && activeNav !== 'security' && activeNav !== 'notices' && activeNav !== 'medical-audit' && activeNav !== 'settings' && activeNav !== 'admin-profile' && (
            <div className="space-y-6">
              
              {/* Header Banner Card for Departments */}
              {activeNav === 'departments' && (
                <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                        🏬 Hospital Organization & Structure
                      </span>
                      <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                        Hospital Departments & OPD Tariff Master
                      </h2>
                      <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium">
                        Manage clinical specialties, OPD consultation fees, room allocations, and active department wings.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddDeptModal(true)}
                      className="bg-primary hover:bg-primaryDark text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 self-start md:self-auto shadow-md active:scale-95 flex-shrink-0"
                    >
                      ➕ Create New Department
                    </button>
                  </div>
                </div>
              )}

              {/* Header Banner Card for Doctors Directory */}
              {activeNav === 'doctors' && (
                <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                        🩺 Medical Staff & Specialists Directory
                      </span>
                      <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                        Doctors Master Directory & Roster
                      </h2>
                      <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium">
                        Review medical qualifications, consultation tariffs, availability schedules, and doctor account approvals.
                      </p>
                    </div>
                    <button
                      onClick={() => loadDirectory('/admin/doctors')}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition flex items-center gap-2 self-start md:self-auto flex-shrink-0"
                    >
                      🔄 Refresh Doctors
                    </button>
                  </div>
                </div>
              )}

              {/* Header Banner Card for Patients Directory */}
              {activeNav === 'patients' && (
                <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                        👥 Registered Patients & Medical Records
                      </span>
                      <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                        Patients Master Directory & Health Records
                      </h2>
                      <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium">
                        Access registered patients, OPD consultation histories, emergency contact details, and health profiles.
                      </p>
                    </div>
                    <button
                      onClick={() => loadDirectory('/admin/patients')}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition flex items-center gap-2 self-start md:self-auto flex-shrink-0"
                    >
                      🔄 Refresh Patients
                    </button>
                  </div>
                </div>
              )}

              {/* Header Banner Card for Staff Members */}
              {activeNav === 'staff' && (
                <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                        📋 Clinical & Administrative Personnel
                      </span>
                      <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                        Staff Members & Reception Desk
                      </h2>
                      <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium">
                        Manage hospital receptionists, OPD desk operators, administrative personnel, and system access rights.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddStaffModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 self-start md:self-auto shadow-md active:scale-95 flex-shrink-0"
                    >
                      ➕ Add Staff Member
                    </button>
                  </div>
                </div>
              )}

              {/* Header Banner Card for Master Appointments */}
              {activeNav === 'appointments' && (
                <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                        📅 Real-Time OPD Queue & Token Master
                      </span>
                      <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                        Master OPD Appointments & Schedules
                      </h2>
                      <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium">
                        Track real-time OPD consultation tokens, appointment statuses, doctor availability, and consultation queues.
                      </p>
                    </div>
                    <button
                      onClick={() => loadDirectory('/admin/appointments')}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition flex items-center gap-2 self-start md:self-auto flex-shrink-0"
                    >
                      🔄 Refresh Appointments
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 text-darkNavy dark:text-slate-100 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base capitalize">
                      {activeNav} Records ({filteredList.length})
                    </h3>
                    <p className="text-xs text-slateText dark:text-slate-400">Browse, search, and manage registered {activeNav}.</p>
                  </div>
                </div>

              {/* Department Summary Cards (Total, Active, Deactivated) */}
              {activeNav === 'departments' && (() => {
                const targetList = listData.length > 0 ? listData : allDepartments;
                const totalCount = targetList.length;
                const activeCount = targetList.filter(d => d.active !== false).length;
                const deactiveCount = targetList.filter(d => d.active === false).length;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    <div
                      onClick={() => setDeptStatusFilter('ALL')}
                      className={`cursor-pointer bg-gradient-to-br from-indigo-500/10 via-slate-900/60 to-slate-900/90 border rounded-2xl p-4 flex items-center justify-between shadow-card hover:shadow-cardHover transition-all ${
                        deptStatusFilter === 'ALL'
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-indigo-500/20 scale-[1.01]'
                          : 'border-indigo-500/30 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Total Departments</span>
                        <h4 className="text-2xl font-black text-white mt-1">{totalCount}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click to show all registered wings</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl">
                        🏬
                      </div>
                    </div>

                    <div
                      onClick={() => setDeptStatusFilter('ACTIVE')}
                      className={`cursor-pointer bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-slate-900/90 border rounded-2xl p-4 flex items-center justify-between shadow-card hover:shadow-cardHover transition-all ${
                        deptStatusFilter === 'ACTIVE'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-emerald-500/20 scale-[1.01]'
                          : 'border-emerald-500/30 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Active Departments</span>
                        <h4 className="text-2xl font-black text-white mt-1">{activeCount}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click to show active wings only</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">
                        ✅
                      </div>
                    </div>

                    <div
                      onClick={() => setDeptStatusFilter('DEACTIVE')}
                      className={`cursor-pointer bg-gradient-to-br from-rose-500/10 via-slate-900/60 to-slate-900/90 border rounded-2xl p-4 flex items-center justify-between shadow-card hover:shadow-cardHover transition-all ${
                        deptStatusFilter === 'DEACTIVE'
                          ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-rose-500/20 scale-[1.01]'
                          : 'border-rose-500/30 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">Deactivated Departments</span>
                        <h4 className="text-2xl font-black text-white mt-1">{deactiveCount}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click to show deactivated wings only</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-2xl">
                        🚫
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="max-w-md w-full relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${activeNav}...`}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-darkNavy dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {activeNav === 'departments' && deptStatusFilter !== 'ALL' && (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                      deptStatusFilter === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}>
                      {deptStatusFilter === 'ACTIVE' ? '✅ Showing Active Wings Only' : '🚫 Showing Deactivated Wings Only'}
                    </span>
                    <button
                      onClick={() => setDeptStatusFilter('ALL')}
                      className="text-xs font-bold text-slate-400 hover:text-white hover:underline px-2 py-1"
                    >
                      Show All
                    </button>
                  </div>
                )}

                {activeNav === 'doctors' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={doctorDeptFilter}
                      onChange={(e) => setDoctorDeptFilter(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-darkNavy dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer max-w-[220px] truncate shadow-2xs"
                      title="Filter Doctors by Department"
                    >
                      <option value="ALL">🏬 All Departments ({allDepartments.length})</option>
                      {allDepartments.map((dept) => (
                        <option key={dept._id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>

                    {doctorDeptFilter !== 'ALL' && (
                      <button
                        onClick={() => setDoctorDeptFilter('ALL')}
                        className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                )}

                {activeNav === 'patients' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Gender Filter */}
                    <select
                      value={patientGenderFilter}
                      onChange={(e) => setPatientGenderFilter(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-darkNavy dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
                      title="Filter Patients by Gender"
                    >
                      <option value="ALL">👤 All Genders</option>
                      <option value="MALE">👨 Male</option>
                      <option value="FEMALE">👩 Female</option>
                    </select>

                    {/* Department Filter */}
                    <select
                      value={patientDeptFilter}
                      onChange={(e) => setPatientDeptFilter(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-darkNavy dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer max-w-[200px] truncate shadow-2xs"
                      title="Filter Patients by Department"
                    >
                      <option value="ALL">🏬 All Departments</option>
                      {allDepartments.map((dept) => (
                        <option key={dept._id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>

                    {(patientGenderFilter !== 'ALL' || patientDeptFilter !== 'ALL') && (
                      <button
                        onClick={() => { setPatientGenderFilter('ALL'); setPatientDeptFilter('ALL'); }}
                        className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Data View: Rich Department Grid or Table */}
              {loadingList ? (
                <div className="py-12 text-center text-xs text-slateText">Loading {activeNav} data...</div>
              ) : filteredList.length === 0 ? (
                <EmptyState icon="🔍" message={`No records matching "${searchTerm}" found.`} />
              ) : activeNav === 'departments' ? (
                /* RICH DEPARTMENT CARD GRID */
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredList.map((dept) => {
                    const icon = getDeptIcon(dept.name);
                    const assignedDocsCount = allDoctors.filter((doc) => {
                      const spec = (doc.specialization || '').toLowerCase().trim();
                      const deptName = (dept.name || '').toLowerCase().trim();
                      const docDeptName = (doc.department?.name || '').toLowerCase().trim();
                      const docDeptId = (doc.department?._id || doc.department || '').toString();
                      const deptId = (dept._id || '').toString();

                      return (
                        (deptId && docDeptId && docDeptId === deptId) ||
                        (deptName && docDeptName && docDeptName === deptName) ||
                        (spec && deptName && (spec === deptName || spec.includes(deptName) || deptName.includes(spec)))
                      );
                    }).length;

                    return (
                      <div
                        key={dept._id}
                        className="bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-primary/40 dark:hover:border-primary/50 rounded-2xl p-5 shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col justify-between group"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-sky-300 text-2xl flex items-center justify-center border border-primary/20 dark:border-primary/40 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition duration-300">
                              {icon}
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleDepartmentActive(dept)}
                              title={dept.active === false ? 'Click to Activate (Will become visible to patients)' : 'Click to Deactivate (Will be hidden from patients)'}
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase transition-all duration-200 cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs ${
                                dept.active !== false
                                  ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                                  : 'bg-rose-100 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-900'
                              }`}
                            >
                              <span>{dept.active !== false ? '🟢 ACTIVE WING' : '🔴 DEACTIVATED'}</span>
                            </button>
                          </div>

                          <div>
                            <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-sm group-hover:text-primary dark:group-hover:text-sky-300 transition-colors">
                              {dept.name}
                            </h3>
                          </div>

                          <p className="text-xs text-slateText dark:text-slate-300 leading-relaxed line-clamp-3">
                            {dept.description || 'Comprehensive diagnosis and clinical treatment services.'}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                          <div className="flex items-center justify-between text-xs gap-1 flex-wrap">
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              👨‍⚕️ {assignedDocsCount} Doctor{assignedDocsCount !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              💳 ₹{dept.consultationFee} / Visit
                            </span>
                          </div>

                          {/* Bottom Action Footer Bar */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: #{dept._id?.slice(-4)}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingDept(dept); }}
                                title="Edit Department Details"
                                className="p-1 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-extrabold transition shadow-2xs flex items-center gap-1"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeletingDept(dept); }}
                                title="Delete Department"
                                className="p-1 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-extrabold transition shadow-2xs flex items-center gap-1"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : activeNav === 'doctors' ? (
                /* RICH DOCTOR DIRECTORY PROFILE CARD GRID */
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredList.map((doc) => {
                    const rawName = (doc.user?.fullName || doc.fullName || '').replace(/^dr\.\s+/i, '').trim();
                    const docName = rawName ? `Dr. ${rawName}` : 'Specialist Doctor';
                    const rawAvatarUrl = doc.profileImage || doc.avatarUrl || doc.user?.avatarUrl || doc.user?.profileImage || doc.user?.avatar || doc.user?.photoUrl;
                    const avatarUrl = rawAvatarUrl ? (rawAvatarUrl.startsWith('/uploads/') ? `http://localhost:5000${rawAvatarUrl}` : rawAvatarUrl) : '';
                    const initials = rawName
                      ? rawName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : 'DR';
                    const specIcon = getDeptIcon(doc.specialization || '');

                    return (
                      <div
                        key={doc._id}
                        className="bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-primary/40 dark:hover:border-primary/50 rounded-2xl p-5 shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col justify-between group"
                      >
                        <div className="space-y-3.5">
                          {/* Avatar & Header */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3.5">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={docName}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover object-top border-2 border-primary/30 shadow-md group-hover:scale-105 transition-transform shrink-0"
                                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                              ) : null}
                              <div
                                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary to-primaryDark text-white font-poppins font-extrabold text-2xl items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0 ${avatarUrl ? 'hidden' : 'flex'}`}
                              >
                                {initials}
                              </div>
                              <div>
                                <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base group-hover:text-primary dark:group-hover:text-sky-300 transition-colors">
                                  {docName}
                                </h3>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              {doc.user?.active !== false ? (
                                <span className="text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                  DEACTIVE
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Qualifications Badge */}
                          {doc.qualification && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5 text-xs text-darkNavy dark:text-slate-200 font-medium flex items-start gap-1.5 shadow-2xs">
                              <span>🎓</span>
                              <span className="leading-tight">{doc.qualification}</span>
                            </div>
                          )}

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-slateText dark:text-slate-400 text-[10px] block font-medium">Clinical Experience</span>
                              <span className="font-bold text-darkNavy dark:text-white">{doc.experienceYears ? `${doc.experienceYears} Years` : '0 Years'}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-slateText dark:text-slate-400 text-[10px] block font-medium">Hospital Department</span>
                              <span className="font-bold text-indigo-700 dark:text-sky-300 truncate block">
                                🏬 {doc.department?.name || doc.specialization || 'General Medicine'}
                              </span>
                            </div>
                          </div>

                          {/* Side-by-Side Grid: Contact Details (Left) & Availability Schedule (Right) */}
                          <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                            {/* Left Column: Contact Details */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 space-y-2 shadow-2xs flex flex-col justify-center">
                              <p className="font-bold text-darkNavy dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1 text-xs">
                                <span>📇</span> Contact Info:
                              </p>
                              <div className="space-y-1 text-xs">
                                {doc.user?.email && (
                                  <p className="flex items-center gap-1.5 text-darkNavy dark:text-slate-200 truncate">
                                    <span className="text-slate-400">📧</span>
                                    <span className="font-medium truncate" title={doc.user.email}>{doc.user.email}</span>
                                  </p>
                                )}
                                {doc.user?.phone && (
                                  <p className="flex items-center gap-1.5 font-mono text-darkNavy dark:text-slate-200">
                                    <span className="text-slate-400">📞</span>
                                    <span className="font-bold truncate">{doc.user.phone}</span>
                                  </p>
                                )}
                                {!doc.user?.phone && !doc.user?.email && (
                                  <p className="text-slate-400 text-xs italic">No contact details</p>
                                )}
                              </div>
                            </div>

                            {/* Right Column: Availability Schedule */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 space-y-2 shadow-2xs flex flex-col justify-center">
                              <p className="font-bold text-darkNavy dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1 text-xs">
                                <span>📅</span> Availability Schedule:
                              </p>
                              <div className="space-y-1 font-mono text-[11px]">
                                {parseAvailabilityScheduleLines(doc.availabilitySchedule).map((line, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-darkNavy dark:text-sky-300 font-semibold truncate">
                                    <span className="text-primary dark:text-sky-400 font-bold">•</span>
                                    <span className="truncate">{line}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer Admin Action Controls */}
                        <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                          {doc.user && (
                            <button
                              onClick={() => handleToggleUserStatus(doc.user, 'doctors')}
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl transition shadow-2xs border ${
                                doc.user.active !== false
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              }`}
                            >
                              {doc.user.active !== false ? '🔒 Deactivate Login' : '🔓 Activate Login'}
                            </button>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingDoctor(doc)}
                              title="Edit Doctor Profile"
                              className="p-1 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-extrabold transition shadow-2xs flex items-center gap-1"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => setDeletingDoctor(doc)}
                              title="Delete Doctor"
                              className="p-1 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-extrabold transition shadow-2xs flex items-center gap-1"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : activeNav === 'patients' ? (
                /* RICH PATIENT DIRECTORY PROFILE CARD GRID */
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredList.map((patient) => {
                    const patName = patient.user?.fullName || 'Patient Account';
                    const initials = patName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    const patientAppts = allAppointments.filter(
                      (a) =>
                        (a.patient?._id && a.patient._id === patient._id) ||
                        (a.patient?.user?._id && patient.user?._id && a.patient.user._id === patient.user._id) ||
                        (a.patient?.user?.email && patient.user?.email && a.patient.user.email === patient.user.email)
                    );

                    let apptBadge = null;
                    if (patientAppts.length > 0) {
                      const latestStatus = (patientAppts[0]?.status || 'UPCOMING').toUpperCase();
                      if (latestStatus === 'COMPLETED') {
                        apptBadge = (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            COMPLETED
                          </span>
                        );
                      } else if (latestStatus === 'PENDING') {
                        apptBadge = (
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            PENDING
                          </span>
                        );
                      } else {
                        apptBadge = (
                          <span className="text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                            UPCOMING
                          </span>
                        );
                      }
                    } else {
                      apptBadge = (
                        <span className="text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                          UPCOMING
                        </span>
                      );
                    }

                    const patientDeptName =
                      patientAppts[0]?.doctor?.department?.name ||
                      patientAppts[0]?.doctor?.specialization ||
                      patient.department?.name ||
                      'General Medicine';

                    const deptIcon = getDeptIcon(patientDeptName);

                    const latestAppt = patientAppts[0];
                    const rawApptDate = latestAppt?.appointmentDate || latestAppt?.createdAt || patient.createdAt;
                    const apptDateFormatted = formatDateDDMMYYYY(rawApptDate);

                    const isUpcomingTreatment =
                      latestAppt?.status === 'SCHEDULED' ||
                      latestAppt?.status === 'CONFIRMED' ||
                      latestAppt?.status === 'UPCOMING' ||
                      (!latestAppt && rawApptDate && new Date(rawApptDate).getTime() >= Date.now() - 86400000);

                    return (
                      <div
                        key={patient._id}
                        className="bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500/40 dark:hover:border-teal-500/50 rounded-2xl p-5 shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col justify-between group"
                      >
                        <div className="space-y-3.5">
                          {/* Avatar & Header */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-poppins font-extrabold text-base flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                {initials}
                              </div>
                              <div>
                                <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                                  {patName}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 uppercase">
                                    PATIENT
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700 px-2 py-0.5 rounded-full">
                                    <span>{deptIcon}</span> {patientDeptName}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>{apptBadge}</div>
                          </div>

                          {/* Contact Info Box */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 space-y-1.5 text-xs text-darkNavy dark:text-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 dark:text-slate-400">📞 Phone:</span>
                              <span className="font-bold font-mono text-darkNavy dark:text-white">{patient.user?.phone || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-slate-400 dark:text-slate-400">📧 Email:</span>
                              <span className="font-medium truncate text-darkNavy dark:text-slate-200">{patient.user?.email || '—'}</span>
                            </div>
                          </div>

                          {/* Health & Department Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-slateText dark:text-slate-400 text-[10px] block font-medium">Blood Group</span>
                              <span className="font-bold text-rose-600 dark:text-rose-400">🩸 {patient.bloodGroup || 'B+'}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-slateText dark:text-slate-400 text-[10px] block font-medium">Gender</span>
                              <span className="font-bold text-darkNavy dark:text-white capitalize">{patient.gender?.toLowerCase() || 'Male'}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 col-span-2">
                              <span className="text-slateText dark:text-slate-400 text-[10px] block font-medium">Consulting Medical Department</span>
                              <span className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1 mt-0.5">
                                <span>{deptIcon}</span> {patientDeptName}
                              </span>
                            </div>
                          </div>

                          {/* Address Info */}
                          {patient.address && (
                            <div className="text-xs text-slateText dark:text-slate-300 flex items-start gap-1.5 pt-1">
                              <span>📍</span>
                              <span className="font-medium text-darkNavy dark:text-slate-200 truncate">{patient.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer Info - Date of Appointment (Left) & Patient ID (Right) */}
                        <div className="pt-3 mt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slateText dark:text-slate-400">
                          <span className="font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1">
                            <span>📅 Date of Appointment:</span>
                            <strong className="text-darkNavy dark:text-white font-mono font-bold">{apptDateFormatted}</strong>
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono">ID: #{patient._id?.slice(-4)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : activeNav === 'staff' ? (
                /* RICH STAFF MEMBER DIRECTORY PROFILE CARD GRID */
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredList.map((staff) => {
                    const staffName = staff.user?.fullName || 'Staff Member';
                    const initials = staffName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={staff._id}
                        className="bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/40 dark:hover:border-indigo-500/50 rounded-2xl p-5 shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col justify-between group"
                      >
                        <div className="space-y-3.5">
                          {/* Avatar & Header */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-poppins font-extrabold text-base flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                {initials}
                              </div>
                              <div>
                                <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base group-hover:text-indigo-700 dark:group-hover:text-sky-300 transition-colors">
                                  {staffName}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 uppercase">
                                    {staff.designation === 'OPD_DESK'
                                      ? '🩺 OPD DESK'
                                      : staff.designation === 'OPERATION_THEATER'
                                      ? '✂️ OP THEATER'
                                      : staff.designation === 'BILLING_DESK'
                                      ? '💳 BILLING DESK'
                                      : staff.designation === 'PHARMACY_DESK'
                                      ? '💊 PHARMACY DESK'
                                      : staff.designation === 'PATIENT_CARE'
                                      ? '💬 PATIENT CARE'
                                      : '📋 RECEPTIONIST'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <StatusBadge status={staff.approvalStatus || 'APPROVED'} />
                              {staff.user?.active !== false ? (
                                <span className="text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                  DEACTIVE
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Contact Info Box */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 space-y-1.5 text-xs text-darkNavy dark:text-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 dark:text-slate-400">📞 Phone:</span>
                              <span className="font-bold font-mono text-darkNavy dark:text-white">{staff.user?.phone || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-slate-400 dark:text-slate-400">📧 Email:</span>
                              <span className="font-medium truncate text-darkNavy dark:text-slate-200">{staff.user?.email || '—'}</span>
                            </div>
                          </div>

                          {/* RBAC Permissions Summary */}
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                            <span className="text-slateText dark:text-slate-400 text-[11px] font-medium">RBAC Operation Status</span>
                            <span className={`font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border ${
                              Array.isArray(staff.permissions) && staff.permissions.length > 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            }`}>
                              {Array.isArray(staff.permissions) && staff.permissions.length > 0
                                ? `✓ ${staff.permissions.length} Operations Granted`
                                : '🚫 All Permissions Revoked'}
                            </span>
                          </div>
                        </div>

                        {/* Footer Controls: Active Toggle, RBAC Rules, Edit, Delete */}
                        <div className="pt-3 mt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-1.5 text-xs">
                          <button
                            onClick={() => handleToggleStaffActive(staff.user)}
                            className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
                              staff.user?.active !== false
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                            }`}
                            title="Click to toggle staff login access"
                          >
                            <span>{staff.user?.active !== false ? '🟢 Active' : '🔴 Deactive'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setRbacStaff(staff)}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1 cursor-pointer"
                              title="Manage RBAC designation & revoke/grant permissions"
                            >
                              <span>🛡️</span> RBAC
                            </button>
                            <button
                              onClick={() => setEditingStaff(staff)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-darkNavy dark:text-slate-200 font-bold text-[10px] transition flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                            >
                              <span>✏️</span> Edit
                            </button>
                            <button
                              onClick={() => setDeletingStaff(staff)}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-800 transition flex items-center gap-1"
                            >
                              <span>🗑️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* STANDARD DATA TABLE FOR APPOINTMENTS */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 text-slateText dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                        {activeNav === 'appointments' && (
                          <>
                            <th className="py-3 px-4">Patient</th>
                            <th className="py-3 px-4">Doctor</th>
                            <th className="py-3 px-4">Date & Time</th>
                            <th className="py-3 px-4">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredList.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          {activeNav === 'appointments' && (
                            <>
                              <td className="py-3 px-4 font-bold text-darkNavy dark:text-white">{item.patient?.user?.fullName || item.patient?.fullName || 'Patient'}</td>
                              <td className="py-3 px-4 text-slateText dark:text-slate-300">Dr. {item.doctor?.user?.fullName || item.doctor?.fullName || 'Doctor'}</td>
                              <td className="py-3 px-4 text-slateText dark:text-slate-300">{item.appointmentDate} • {item.appointmentTime}</td>
                              <td className="py-3 px-4">
                                {item.status === 'ACCEPTED' || item.status === 'APPROVED' || item.status === 'CONFIRMED' ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    {item.status}
                                  </span>
                                ) : item.status === 'PENDING' ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    {item.status}
                                  </span>
                                ) : item.status === 'CANCELLED' || item.status === 'REJECTED' ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    {item.status}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    {item.status}
                                  </span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

          {/* TAB: PATIENT INQUIRIES & SUPPORT DESK */}
          {activeNav === 'inquiries' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      Patient Support Desk Active
                    </div>
                    <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                      Patient Inquiries & Feedback Desk
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium leading-relaxed">
                      Review, manage, and respond to general inquiries, appointment queries, and feedback submitted by hospital visitors and patients.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                    <button
                      onClick={fetchInquiries}
                      disabled={loadingInquiries}
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl text-xs font-extrabold transition active:scale-95 text-white shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      🔄 Refresh Inquiries
                    </button>
                    {inquiries.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsDeletingAllInquiries(true)}
                        className="inline-flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 px-4 py-2.5 rounded-xl text-xs font-extrabold transition active:scale-95 shadow-md cursor-pointer"
                      >
                        🗑️ Delete All Inquiries
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  label="Total Inquiries"
                  value={inquiries.length}
                  icon="📋"
                  gradient="from-blue-500/10 to-blue-600/5"
                  borderColor="border-blue-200 dark:border-blue-800"
                  textColor="text-blue-700 dark:text-blue-300"
                  badge="All Messages"
                />
                <StatCard
                  label="New & Pending"
                  value={inquiries.filter((i) => i.status === 'NEW' || !i.status).length}
                  icon="⚠️"
                  gradient="from-amber-500/10 to-amber-600/5"
                  borderColor="border-amber-200 dark:border-amber-800"
                  textColor="text-amber-700 dark:text-amber-300"
                  badge="Requires Action"
                />
                <StatCard
                  label="In Progress"
                  value={inquiries.filter((i) => i.status === 'IN_PROGRESS').length}
                  icon="⏳"
                  gradient="from-purple-500/10 to-purple-600/5"
                  borderColor="border-purple-200 dark:border-purple-800"
                  textColor="text-purple-700 dark:text-purple-300"
                  badge="Under Review"
                />
                <StatCard
                  label="Resolved Tickets"
                  value={inquiries.filter((i) => i.status === 'RESOLVED').length}
                  icon="✅"
                  gradient="from-emerald-500/10 to-emerald-600/5"
                  borderColor="border-emerald-200 dark:border-emerald-800"
                  textColor="text-emerald-700 dark:text-emerald-300"
                  badge="Completed"
                />
              </div>

              {/* Search & Filter Toolbar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Search patient name, email, phone, ticket ID or message..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {inquirySearch && (
                      <button
                        onClick={() => setInquirySearch('')}
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Status Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Status:</span>
                    {[
                      { id: 'ALL', label: 'All Tickets' },
                      { id: 'NEW', label: '⚠️ New' },
                      { id: 'IN_PROGRESS', label: '⏳ In Progress' },
                      { id: 'RESOLVED', label: '✅ Resolved' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setInquiryStatusFilter(f.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          inquiryStatusFilter === f.id
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table / List */}
                {loadingInquiries ? (
                  <div className="py-16 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    Loading inquiry tickets...
                  </div>
                ) : (
                  (() => {
                    const filteredInquiries = inquiries.filter((iq) => {
                      const search = inquirySearch.toLowerCase().trim();
                      const statusMatch =
                        inquiryStatusFilter === 'ALL' ||
                        (inquiryStatusFilter === 'NEW' && (iq.status === 'NEW' || !iq.status)) ||
                        iq.status === inquiryStatusFilter;

                      if (!statusMatch) return false;
                      if (!search) return true;

                      const ticketId = iq._id?.toString().toLowerCase() || '';
                      const name = iq.fullName?.toLowerCase() || '';
                      const email = iq.email?.toLowerCase() || '';
                      const phone = iq.phone?.toLowerCase() || '';
                      const subject = iq.subject?.toLowerCase() || '';
                      const msg = iq.message?.toLowerCase() || '';

                      return (
                        ticketId.includes(search) ||
                        name.includes(search) ||
                        email.includes(search) ||
                        phone.includes(search) ||
                        subject.includes(search) ||
                        msg.includes(search)
                      );
                    });

                    if (filteredInquiries.length === 0) {
                      return <EmptyState icon="💬" message="No patient inquiries matching your filter criteria." />;
                    }

                    return (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800/80 text-darkNavy dark:text-slate-200 font-poppins font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="py-3.5 px-4">Ticket ID</th>
                              <th className="py-3.5 px-4">Patient / Visitor</th>
                              <th className="py-3.5 px-4">Category / Subject</th>
                              <th className="py-3.5 px-4">Message Snippet</th>
                              <th className="py-3.5 px-4">Date Submitted</th>
                              <th className="py-3.5 px-4 text-center">Ticket Status</th>
                              <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredInquiries.map((iq) => {
                              const ticketCode = `#TKT-${iq._id.slice(-6).toUpperCase()}`;
                              const dateStr = new Date(iq.createdAt || Date.now()).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              });

                              return (
                                <tr
                                  key={iq._id}
                                  onClick={() => setSelectedInquiry(iq)}
                                  className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 transition cursor-pointer group"
                                >
                                  <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-600 dark:text-sky-300">
                                    {ticketCode}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-darkNavy dark:text-white text-sm group-hover:text-primary dark:group-hover:text-sky-300 transition-colors">{iq.fullName}</div>
                                    <div className="text-[11px] font-bold text-slate-600 dark:text-white font-mono mt-0.5">📞 {iq.phone || '—'}</div>
                                    <div className="text-[11px] font-bold text-slate-600 dark:text-white font-mono truncate max-w-[200px] mt-0.5">📧 {iq.email}</div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                      {iq.subject || 'General Inquiry'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 max-w-xs">
                                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                      "{iq.message}"
                                    </p>
                                  </td>
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-white whitespace-nowrap text-[11px]">
                                    {dateStr}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <select
                                      value={iq.status || 'NEW'}
                                      disabled={updatingInquiryId === iq._id}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => { e.stopPropagation(); handleUpdateInquiryStatus(iq._id, e.target.value); }}
                                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition ${
                                        iq.status === 'RESOLVED'
                                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                          : iq.status === 'IN_PROGRESS'
                                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                          : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                      }`}
                                    >
                                      <option value="NEW">⚠️ NEW</option>
                                      <option value="IN_PROGRESS">⏳ IN PROGRESS</option>
                                      <option value="RESOLVED">✅ RESOLVED</option>
                                    </select>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedInquiry(iq); }}
                                        className="p-1.5 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                      >
                                        💬 View & Reply
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setDeletingInquiry(iq); }}
                                        className="p-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {/* VIEW: LEAVE APPLICATIONS REGISTER */}
          {activeNav === 'leaves' && (
            <div className="space-y-6">
              {/* Header Hero Banner */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      🏖️ Real-Time Absence & Leave Control
                    </span>
                    <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                      Doctor & Staff Leave Applications Register
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium">
                      Review, approve, or reject leave applications submitted by Doctors and Hospital Staff members across all departments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={fetchLeavesData}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700/80 px-4 py-2 rounded-full transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <RefreshCw size={14} className={loadingLeaves ? 'animate-spin text-white' : 'text-slate-300'} />
                      <span>Refresh Leaves</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Approvals</p>
                    <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                      {leavesData.pendingCount}
                    </h4>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl border border-amber-300 dark:border-amber-700">
                    ⏳
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Doctors On Leave</p>
                    <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {leavesData.doctorsOnLeave.length}
                    </h4>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl border border-emerald-300 dark:border-emerald-700">
                    🩺
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Staff On Leave</p>
                    <h4 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                      {leavesData.staffOnLeave.length}
                    </h4>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl border border-purple-300 dark:border-purple-700">
                    📋
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Active Duty Personnel</p>
                    <h4 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
                      {(leavesData.allDoctors.length - leavesData.doctorsOnLeave.length) + (leavesData.allStaff.length - leavesData.staffOnLeave.length)}
                    </h4>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl border border-sky-300 dark:border-sky-700">
                    🟢
                  </div>
                </div>
              </div>

              {/* Filter Tabs & Content Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: 'PENDING', label: `Pending Approvals (${leavesData.pendingCount})` },
                      { id: 'APPROVED', label: `Approved Leaves (${leavesData.approvedRequests.length})` },
                      { id: 'REJECTED', label: `Rejected Applications (${leavesData.rejectedRequests.length})` },
                      { id: 'DIRECTORY', label: `Full Roster (${leavesData.allDoctors.length + leavesData.allStaff.length})` },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setLeaveTab(t.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                          leaveTab === t.id
                            ? 'bg-amber-500 text-darkNavy shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaves Content */}
                {loadingLeaves ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Loading leave records...</div>
                ) : (
                  (() => {
                    if (leaveTab === 'PENDING') {
                      if (leavesData.pendingRequests.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-950 rounded-2xl">
                            🎉 No pending leave applications requiring approval!
                          </div>
                        );
                      }
                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                                <th className="py-3 px-4 rounded-l-xl">Applicant Name</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-4">Reason For Leave</th>
                                <th className="py-3 px-4">Applied Date</th>
                                <th className="py-3 px-4 rounded-r-xl text-right">Approval Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                              {leavesData.pendingRequests.map((req) => (
                                <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                  <td className="py-3.5 px-4 font-bold text-darkNavy dark:text-white">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{req.applicantModel === 'Doctor' ? '🩺' : '📋'}</span>
                                      <div>
                                        <p className="font-bold text-darkNavy dark:text-white">{req.applicantName}</p>
                                        <p className="text-[11px] font-normal text-slate-400">{req.applicantEmail}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300">
                                      {req.role}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 max-w-xs">
                                    <p className="text-darkNavy dark:text-slate-200 text-xs font-semibold">"{req.reason}"</p>
                                    {(req.startDate || req.endDate) && (
                                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Dates: {req.startDate || '—'} to {req.endDate || '—'}</p>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                    {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleApproveLeaveRequest(req._id)}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1"
                                      >
                                        <span>✅ Approve</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRejectLeaveRequest(req._id)}
                                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1"
                                      >
                                        <span>❌ Reject</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    if (leaveTab === 'APPROVED') {
                      if (leavesData.approvedRequests.length === 0 && leavesData.doctorsOnLeave.length === 0 && leavesData.staffOnLeave.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-950 rounded-2xl">
                            No active approved leave records.
                          </div>
                        );
                      }
                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                                <th className="py-3 px-4 rounded-l-xl">Personnel Name</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-4">Approved Reason</th>
                                <th className="py-3 px-4">Approved Date</th>
                                <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                              {leavesData.approvedRequests.map((req) => {
                                const formattedName = req.applicantModel === 'Doctor'
                                  ? (req.applicantName.startsWith('Dr.') ? req.applicantName : `Dr. ${req.applicantName}`)
                                  : req.applicantName;
                                return (
                                  <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="py-3.5 px-4 font-bold text-darkNavy dark:text-white">
                                      <div className="flex items-center gap-2">
                                        <span className="text-base">{req.applicantModel === 'Doctor' ? '🩺' : '📋'}</span>
                                        <div>
                                          <p className="font-bold text-darkNavy dark:text-white">{formattedName}</p>
                                          <p className="text-[11px] font-normal text-slate-400">{req.applicantEmail}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                        req.applicantModel === 'Doctor'
                                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300'
                                          : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300'
                                      }`}>
                                        {req.applicantModel === 'Doctor' ? '🩺 DOCTOR' : (req.role || 'STAFF')}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 max-w-xs">
                                      <p className="text-darkNavy dark:text-slate-200 text-xs">"{req.reason}"</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                      {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : 'Previously Approved'}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleRevokeLeaveRequest(req._id)}
                                        className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
                                      >
                                        🟢 Revoke Leave / Resume Duty
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    if (leaveTab === 'REJECTED') {
                      if (leavesData.rejectedRequests.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-950 rounded-2xl">
                            No rejected leave applications.
                          </div>
                        );
                      }
                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                                <th className="py-3 px-4 rounded-l-xl">Applicant Name</th>
                                <th className="py-3 px-4">Role / Department</th>
                                <th className="py-3 px-4">Reason Submitted & Dates</th>
                                <th className="py-3 px-4">Admin Rejection Reason</th>
                                <th className="py-3 px-4 rounded-r-xl">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                              {leavesData.rejectedRequests.map((req) => {
                                const formattedName = req.applicantModel === 'Doctor'
                                  ? (req.applicantName.startsWith('Dr.') ? req.applicantName : `Dr. ${req.applicantName}`)
                                  : req.applicantName;
                                return (
                                  <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="py-3.5 px-4 font-bold text-darkNavy dark:text-white">
                                      <div className="flex items-center gap-2">
                                        <span className="text-base">{req.applicantModel === 'Doctor' ? '🩺' : '📋'}</span>
                                        <div>
                                          <p className="font-bold text-darkNavy dark:text-white">{formattedName}</p>
                                          <p className="text-[11px] font-normal text-slate-400">{req.applicantEmail}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                        req.applicantModel === 'Doctor'
                                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300'
                                          : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300'
                                      }`}>
                                        {req.applicantModel === 'Doctor' ? '🩺 DOCTOR' : (req.role || 'STAFF')}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 max-w-xs">
                                      <p className="text-darkNavy dark:text-slate-200 text-xs font-semibold">"{req.reason}"</p>
                                      {(req.startDate || req.endDate) && (
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Dates: {req.startDate || '—'} ➔ {req.endDate || '—'}</p>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-4 max-w-xs">
                                      <div className="text-rose-700 dark:text-rose-300 text-xs font-extrabold bg-rose-50 dark:bg-rose-950/80 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 leading-snug">
                                        ⚠️ "{req.adminComment || req.rejectionReason || 'Denied by Admin'}"
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 inline-flex items-center gap-1">
                                        ❌ REJECTED
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    // DIRECTORY view
                    const fullList = [
                      ...leavesData.allDoctors.map(d => ({ ...d, userType: 'DOCTOR' })),
                      ...leavesData.allStaff.map(s => ({ ...s, userType: 'STAFF' })),
                    ];

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                              <th className="py-3 px-4 rounded-l-xl">Personnel Name</th>
                              <th className="py-3 px-4">Role</th>
                              <th className="py-3 px-4">Leave Status</th>
                              <th className="py-3 px-4">Current Leave Reason</th>
                              <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                            {fullList.map((item) => {
                              const isDoctor = item.userType === 'DOCTOR';
                              const formattedName = isDoctor
                                ? (item.fullName?.startsWith('Dr.') ? item.fullName : `Dr. ${item.fullName}`)
                                : item.fullName;
                              const roleLabel = isDoctor ? '🩺 DOCTOR' : (item.designation || 'STAFF');

                              return (
                                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                  <td className="py-3.5 px-4 font-bold text-darkNavy dark:text-white">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{isDoctor ? '🩺' : '📋'}</span>
                                      <div>
                                        <p className="font-bold text-darkNavy dark:text-white">{formattedName}</p>
                                        <p className="text-[11px] font-normal text-slate-400">{item.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                      isDoctor
                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300'
                                        : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300'
                                    }`}>
                                      {roleLabel}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    {item.onLeave ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1">
                                        🏖️ ON LEAVE
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        ON DUTY
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 max-w-xs">
                                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                                      {item.leaveReason || (item.onLeave ? 'Absence recorded' : 'Active on duty')}
                                    </p>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    {item.onLeave ? (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAdminLeave(item._id, item.userType, false)}
                                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition shadow-2xs cursor-pointer"
                                      >
                                        🟢 Resume Duty
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 font-mono font-medium">ON DUTY</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY AUDIT & LOGIN LOGS */}
          {activeNav === 'security' && (
            <div className="space-y-6">
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      🔐 Real-Time System Security Audit
                    </span>
                    <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                      Security Audit & Access Logs
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-4xl font-medium">
                      Monitor real-time user login attempts, IP addresses, system modifications, and access events across Doctors, Staff, Patients, and Admin.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                    <button
                      onClick={fetchSecurityLogs}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white transition flex items-center gap-1.5"
                    >
                      🔄 Refresh Logs
                    </button>
                    {securityLogs.length > 0 && (
                      <button
                        onClick={() => {
                          setDeletingLogId('ALL');
                          setShowDeleteAuditModal(true);
                          setAdminDeletePwd('');
                          setPwdDeleteError('');
                        }}
                        className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5"
                      >
                        🗑️ Clear Audit Logs
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Filters & Control Toolbar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Role Filter Pills */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slateText dark:text-slate-400 uppercase tracking-wider block">
                      Filter User Role
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'ALL', label: 'All Roles' },
                        { id: 'DOCTOR', label: '🩺 Doctor' },
                        { id: 'STAFF', label: '📋 Staff' },
                        { id: 'PATIENT', label: '👤 Patient' },
                        { id: 'ADMIN', label: '🛡️ Admin' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setAuditRoleFilter(r.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            auditRoleFilter === r.id
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Type Filter Pills */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slateText dark:text-slate-400 uppercase tracking-wider block">
                      Filter Event Type
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'ALL', label: 'All Events' },
                        { id: 'LOGIN', label: '🔐 Logins' },
                        { id: 'SYSTEM_MODIFICATION', label: '⚙️ System Modifications' },
                      ].map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setAuditEventFilter(e.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            auditEventFilter === e.id
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="space-y-1 min-w-[220px]">
                    <label className="text-[11px] font-extrabold text-slateText dark:text-slate-400 uppercase tracking-wider block">
                      Search Audit Logs
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') fetchSecurityLogs();
                        }}
                        placeholder="Name, email, IP, action..."
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {auditSearch && (
                        <button
                          type="button"
                          onClick={() => { setAuditSearch(''); fetchSecurityLogs(); }}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Log Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base">
                    Audit Trail & Event Log Records ({securityLogs.length})
                  </h3>
                </div>

                {loadingSecurity ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Loading security logs...</div>
                ) : securityLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    No security audit records match your current filter parameters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                          <th className="py-3 px-4 rounded-l-xl">User Account</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Event / Action Details</th>
                          <th className="py-3 px-4">IP Address & Device</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                        {securityLogs.map((log) => {
                          const role = log.userRole || log.user?.role || 'SYSTEM';
                          const name = log.userName || log.user?.fullName || 'Anonymous / System';
                          const email = log.userEmail || log.user?.email || '—';
                          const action = log.actionType || 'LOGIN';
                          const details = log.details || (action === 'LOGIN' ? 'User login session' : 'System modification event');

                          return (
                            <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                              <td className="py-3.5 px-4 font-bold text-darkNavy dark:text-white">
                                {name}
                                <span className="block text-[11px] font-normal text-slate-400">{email}</span>
                              </td>
                              <td className="py-3.5 px-4 font-extrabold text-[10px] uppercase">
                                <span className={`px-2.5 py-0.5 rounded-full border ${
                                  role === 'DOCTOR' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                                  : (role === 'STAFF' || role === 'RECEPTIONIST') ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300'
                                  : role === 'ADMIN' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                                  : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300'
                                }`}>
                                  {role === 'RECEPTIONIST' ? 'STAFF' : role}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 max-w-xs">
                                <span className="font-bold text-slate-900 dark:text-white text-xs block">{action}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block">{details}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 block">{log.ipAddress || '127.0.0.1'}</span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">{log.deviceInfo || 'Web Client'}</span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {log.success !== false ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1 whitespace-nowrap shadow-2xs">
                                    ✅ SUCCESS
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1 whitespace-nowrap shadow-2xs">
                                    ❌ FAILED
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-white text-[11px] whitespace-nowrap">
                                {formatDateDDMMYYYY(log.createdAt)} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingLogId(log._id);
                                    setShowDeleteAuditModal(true);
                                    setAdminDeletePwd('');
                                    setPwdDeleteError('');
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-extrabold transition shadow-2xs"
                                  title="Delete this audit log record (Requires admin password)"
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Password Verification Modal for Deleting Audit Logs */}
          {showDeleteAuditModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                  <span className="text-3xl">🔐</span>
                  <div>
                    <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg">
                      Security Authorization Required
                    </h3>
                    <p className="text-xs text-slateText dark:text-slate-400">
                      Verify your admin password to authorize audit log deletion.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 font-medium">
                  🚨 <strong>Warning:</strong> {deletingLogId === 'ALL' ? 'Permanently clearing ALL security audit log records cannot be undone.' : 'Deleting this security audit log record will permanently purge it from the system logs.'}
                </div>

                <div>
                  <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">
                    Enter Admin Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={adminDeletePwd}
                    onChange={(e) => setAdminDeletePwd(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmDeleteAuditLog();
                    }}
                    className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-mono focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {pwdDeleteError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                    ⚠️ {pwdDeleteError}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowDeleteAuditModal(false); setAdminDeletePwd(''); setPwdDeleteError(''); }}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteAuditLog}
                    disabled={deletingAudit || !adminDeletePwd}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
                  >
                    {deletingAudit ? 'Verifying...' : '🗑️ Verify & Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SYSTEM BROADCAST NOTICES */}
          {activeNav === 'notices' && (
            <div className="space-y-6">
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      📢 Hospital Communication System
                    </span>
                    <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                      System Broadcast Notices & Emergency Alerts
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-2xl font-medium">
                      Publish broadcast notices, maintenance alerts, and emergency hospital announcements visible to patients and doctors.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={fetchNotices}
                      title="Refresh Broadcast Notices"
                      className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      onClick={() => setShowNoticeModal(true)}
                      className="bg-primary hover:bg-primaryDark text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      ➕ Publish New Notice
                    </button>
                  </div>
                </div>
              </div>

              {/* Notices List */}
              <div className="space-y-4">
                {loadingNotices ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Loading broadcast notices...</div>
                ) : notices.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-3xl block">📢</span>
                    <h4 className="font-bold text-darkNavy dark:text-white">No Broadcast Notices Active</h4>
                    <p className="text-xs text-slate-400">Click 'Publish New Notice' above to post a hospital announcement.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {notices.map((notice) => (
                      <div key={notice._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${
                              notice.type === 'EMERGENCY'
                                ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                : notice.type === 'MAINTENANCE'
                                ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300'
                            }`}>
                              {notice.type}
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${notice.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                              {notice.active ? '🟢 BROADCASTING' : '⚪ PAUSED'}
                            </span>
                          </div>

                          <h4 className="font-poppins font-bold text-darkNavy dark:text-white text-base">{notice.title}</h4>
                          <p className="text-xs text-slateText dark:text-slate-300 leading-relaxed">{notice.message}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                          <span className="text-[10px] font-mono">{formatDateDDMMYYYY(notice.createdAt)}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleNotice(notice._id)}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-darkNavy dark:text-white transition"
                            >
                              {notice.active ? 'Pause' : 'Resume'}
                            </button>
                            <button
                              onClick={() => handleDeleteNotice(notice._id)}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── BLOG ARTICLES MANAGEMENT ─── */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                      📝 Health Blog Articles ({allBlogs.length})
                    </h3>
                    <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                      Manage medical blog articles. Toggle 🏠 to feature up to 3 blogs on the Home Page.
                    </p>
                  </div>
                  
                  {/* Status Filter & Header Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex-wrap">
                      <button
                        onClick={() => setBlogStatusFilter('ALL')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                          blogStatusFilter === 'ALL'
                            ? 'bg-white dark:bg-slate-900 text-darkNavy dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-darkNavy dark:hover:text-white'
                        }`}
                      >
                        All ({allBlogs.length})
                      </button>
                      <button
                        onClick={() => setBlogStatusFilter('PENDING')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                          blogStatusFilter === 'PENDING'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-amber-600 dark:hover:text-amber-400'
                        }`}
                      >
                        <span>⏳ In Progress</span>
                        <span className="bg-amber-950/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold">
                          {allBlogs.filter((b) => b.status === 'PENDING' || b.status === 'DRAFT').length}
                        </span>
                      </button>
                      <button
                        onClick={() => setBlogStatusFilter('PUBLISHED')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                          blogStatusFilter === 'PUBLISHED'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                        }`}
                      >
                        Published ({allBlogs.filter((b) => b.status === 'PUBLISHED').length})
                      </button>
                      <button
                        onClick={() => setBlogStatusFilter('REJECTED')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                          blogStatusFilter === 'REJECTED'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
                        }`}
                      >
                        Rejected ({allBlogs.filter((b) => b.status === 'REJECTED').length})
                      </button>
                    </div>

                    <button
                      onClick={fetchBlogs}
                      title="Refresh Blogs"
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-darkNavy dark:text-white px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      🔄 Refresh
                    </button>

                    <button
                      onClick={openAddBlog}
                      className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      ➕ Write New Blog
                    </button>
                  </div>
                </div>

                {loadingBlogs ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    Loading blog articles...
                  </div>
                ) : allBlogs.filter((b) => blogStatusFilter === 'ALL' ? true : blogStatusFilter === 'PENDING' ? (b.status === 'PENDING' || b.status === 'DRAFT') : b.status === blogStatusFilter).length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <span className="text-3xl block">📝</span>
                    <h4 className="font-bold text-darkNavy dark:text-white">No {blogStatusFilter !== 'ALL' ? blogStatusFilter.toLowerCase() : ''} articles found</h4>
                    <p className="text-xs text-slate-400">
                      {blogStatusFilter === 'PENDING' ? 'No doctor blog submissions awaiting review.' : 'Click "Write New Blog" above to publish your first health article.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allBlogs
                      .filter((b) => blogStatusFilter === 'ALL' ? true : blogStatusFilter === 'PENDING' ? (b.status === 'PENDING' || b.status === 'DRAFT') : b.status === blogStatusFilter)
                      .map((blog) => (
                        <div key={blog._id} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col group">
                          {/* Blog Image */}
                          <div
                            onClick={() => setViewingBlog(blog)}
                            className="relative h-36 overflow-hidden bg-slate-200 dark:bg-slate-700 cursor-pointer"
                          >
                            <img
                              src={blog.image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600'}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 flex gap-1.5">
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-primary/90 text-white uppercase backdrop-blur-sm">
                                {blog.category || 'General'}
                              </span>
                              {blog.showOnHome && (
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/90 text-white uppercase backdrop-blur-sm">
                                  🏠 HOME PAGE
                                </span>
                              )}
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase backdrop-blur-sm ${
                                blog.status === 'PUBLISHED'
                                  ? 'bg-emerald-500/90 text-white'
                                  : (blog.status === 'PENDING' || blog.status === 'DRAFT')
                                  ? 'bg-amber-500/90 text-white animate-pulse'
                                  : 'bg-rose-600/90 text-white'
                              }`}>
                                {(blog.status === 'PENDING' || blog.status === 'DRAFT') ? '⏳ IN PROGRESS' : blog.status}
                              </span>
                            </div>
                          </div>

                          {/* Blog Content */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                            <div className="space-y-1.5">
                              <h4
                                onClick={() => setViewingBlog(blog)}
                                className="font-poppins font-bold text-darkNavy dark:text-white text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug cursor-pointer"
                              >
                                {blog.title}
                              </h4>
                              <p className="text-[11px] text-slateText dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {blog.desc}
                              </p>
                              {/* Author, Role & Category Details */}
                              <div className="space-y-1 text-[11px]">
                                <div className="flex items-center gap-1.5 text-darkNavy dark:text-white font-bold">
                                  <span>✍️ Submitted By:</span>
                                  <span className="text-primary font-black">{blog.author || 'Doctor Specialist'}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                                  <span>🏅 Role: <strong className="text-slate-700 dark:text-slate-300">{blog.role || 'Clinical Specialist'}</strong></span>
                                  <span>🏷️ <strong className="text-slate-700 dark:text-slate-300">{blog.category || 'General'}</strong></span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  🕐 {blog.createdAt ? new Date(blog.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                              </div>

                              {blog.status === 'REJECTED' && blog.rejectionReason && (
                                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300">
                                  <strong>Rejection Reason:</strong> "{blog.rejectionReason}"
                                </div>
                              )}
                            </div>

                            {/* Admin Review & Actions */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                              {(blog.status === 'PENDING' || blog.status === 'DRAFT') && (
                                <div className="flex items-center gap-2 pb-1">
                                  <button
                                    onClick={() => setReviewingBlog(blog)}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <span>🔍 Review, Assign Category & Role</span>
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                <button
                                  onClick={() => handleToggleBlogHome(blog._id)}
                                  title={blog.showOnHome ? 'Remove from Home Page' : 'Feature on Home Page'}
                                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                                    blog.showOnHome
                                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {blog.showOnHome ? '🏠 On Home' : '🏠 Add Home'}
                                </button>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setViewingBlog(blog)}
                                    className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-darkNavy dark:text-white transition cursor-pointer"
                                    title="View Full Article"
                                  >
                                    👁️ Read
                                  </button>
                                  <button
                                    onClick={() => openEditBlog(blog)}
                                    className="text-[10px] font-extrabold px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-xs transition cursor-pointer"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => setDeletingBlog(blog)}
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 9: MEDICAL RECORDS & PRESCRIPTIONS AUDIT */}
          {activeNav === 'medical-audit' && (
            <div className="space-y-6">
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      📋 Medical Records & Prescriptions Inspection
                    </span>
                    <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                      Clinical Documentation Audit Trail
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-2xl font-medium">
                      Inspect all generated doctor prescriptions and patient uploaded diagnostic lab reports.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMedicalSubTab('prescriptions')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${medicalSubTab === 'prescriptions' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      💊 Prescriptions ({prescriptions.length})
                    </button>
                    <button
                      onClick={() => setMedicalSubTab('documents')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${medicalSubTab === 'documents' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      📄 Lab Reports ({medicalRecords.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                {loadingMedical ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Loading clinical audit data...</div>
                ) : medicalSubTab === 'prescriptions' ? (
                  <div>
                    <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base mb-4">Doctor Prescriptions Trail</h3>
                    {prescriptions.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-950 rounded-2xl">No prescriptions generated yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                              <th className="py-3 px-4 rounded-l-xl">Patient</th>
                              <th className="py-3 px-4">Attending Doctor</th>
                              <th className="py-3 px-4">Medicines Prescribed</th>
                              <th className="py-3 px-4">AI Clinical Summary</th>
                              <th className="py-3 px-4 rounded-r-xl">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                            {prescriptions.map((presc) => (
                              <tr key={presc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                <td className="py-3.5 px-4 font-bold text-darkNavy dark:text-white">
                                  {presc.appointment?.patient?.user?.fullName || 'Patient'}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-300">
                                  Dr. {presc.appointment?.doctor?.user?.fullName || 'Doctor'}
                                </td>
                                <td className="py-3.5 px-4 max-w-xs truncate font-mono text-xs">{presc.medicines}</td>
                                <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">{presc.aiExplanation || presc.notes || '—'}</td>
                                <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">{formatDateDDMMYYYY(presc.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base mb-4">Patient Lab Reports & Documents</h3>
                    {medicalRecords.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-950 rounded-2xl">No medical documents uploaded yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                              <th className="py-3 px-4 rounded-l-xl">Document Title</th>
                              <th className="py-3 px-4">Record Type</th>
                              <th className="py-3 px-4">Patient Name</th>
                              <th className="py-3 px-4">File Link</th>
                              <th className="py-3 px-4 rounded-r-xl">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                            {medicalRecords.map((rec) => (
                              <tr key={rec._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                <td className="py-3.5 px-4 font-bold text-darkNavy dark:text-white">{rec.title}</td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                                    {rec.recordType}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-semibold">{rec.patient?.user?.fullName || 'Patient'}</td>
                                <td className="py-3.5 px-4">
                                  <a href={rec.fileUrl} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
                                    🔗 View Document
                                  </a>
                                </td>
                                <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">{formatDateDDMMYYYY(rec.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: GLOBAL SYSTEM SETTINGS */}
          {activeNav === 'settings' && (
            <div className="space-y-6">
              {/* Header Hero Card */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      ⚙️ Global System Parameters
                    </span>
                    <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                      Hospital Ecosystem Configuration
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-2xl font-medium">
                      Master hospital profile details, OPD operational hours, appointment slot durations, and policy controls.
                    </p>
                  </div>
                </div>
              </div>

              {/* READ-ONLY / FROZEN FORMAT CARDS DISPLAY */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                  <div>
                    <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base">
                      🏥 Hospital Profile & OPD Operational Parameters
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Current active configuration values enforced system-wide.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditSettingsForm({ ...settingsData });
                      setShowEditSettingsModal(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-darkNavy font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <span>✏️ Edit Configurations</span>
                  </button>
                </div>

                {/* Grid of frozen parameter boxes */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Hospital Name</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white flex items-center gap-2">
                      <span>🏥</span>
                      <span>{settingsData.hospitalName || 'Brainware Medical College & Hospital'}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Emergency Hotline</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white flex items-center gap-2 font-mono">
                      <span>📞</span>
                      <span>{settingsData.emergencyHotline || '+91 1800-123-4567'}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Support Email Address</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white flex items-center gap-2">
                      <span>✉️</span>
                      <span>{settingsData.supportEmail || 'support@brainwarehospital.com'}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Appointment Slot Duration</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white flex items-center gap-2">
                      <span>⏱️</span>
                      <span>{settingsData.slotDurationMinutes || 30} Minutes per Consultation</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">OPD Opening Time</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white flex items-center gap-2 font-mono">
                      <span>🌅</span>
                      <span>{settingsData.opdOpeningTime || '08:00 AM'}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">OPD Closing Time</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white flex items-center gap-2 font-mono">
                      <span>🌙</span>
                      <span>{settingsData.opdClosingTime || '08:00 PM'}</span>
                    </p>
                  </div>
                </div>

                {/* Policy & Automation Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-darkNavy dark:text-white text-xs uppercase tracking-wider">Policy & Security Controls</h4>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-darkNavy dark:text-white text-xs">
                        Doctor Account Auto-Approval Registration Rule
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Controls whether new doctor sign-ups automatically get APPROVED status or require manual Admin verification.
                      </p>
                    </div>

                    {settingsData.autoApproveDoctors ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        🟢 AUTO-APPROVE ENABLED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 self-start sm:self-auto">
                        🔒 MANUAL REVIEW REQUIRED
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-darkNavy dark:text-white text-xs">
                        Hospital Staff Account Auto-Approval Registration Rule
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Controls whether new hospital staff sign-ups automatically get APPROVED status or require manual Admin verification.
                      </p>
                    </div>

                    {settingsData.autoApproveStaff ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        🟢 AUTO-APPROVE ENABLED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 self-start sm:self-auto">
                        🔒 MANUAL REVIEW REQUIRED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* EDIT CONFIGURATIONS MODAL */}
              {showEditSettingsModal && (
                <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scaleUp">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                        <span>✏️ Edit Hospital Configurations</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowEditSettingsModal(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveSettingsModal} className="space-y-4 text-xs">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-darkNavy dark:text-white mb-1">Hospital Name *</label>
                          <input
                            type="text"
                            required
                            value={editSettingsForm.hospitalName || ''}
                            onChange={(e) => setEditSettingsForm({ ...editSettingsForm, hospitalName: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-darkNavy dark:text-white mb-1">Emergency Hotline *</label>
                          <input
                            type="text"
                            required
                            value={editSettingsForm.emergencyHotline || ''}
                            onChange={(e) => setEditSettingsForm({ ...editSettingsForm, emergencyHotline: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-darkNavy dark:text-white mb-1">Support Email *</label>
                          <input
                            type="email"
                            required
                            value={editSettingsForm.supportEmail || ''}
                            onChange={(e) => setEditSettingsForm({ ...editSettingsForm, supportEmail: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-darkNavy dark:text-white mb-1">Slot Duration (Minutes) *</label>
                          <input
                            type="number"
                            required
                            value={editSettingsForm.slotDurationMinutes || 30}
                            onChange={(e) => setEditSettingsForm({ ...editSettingsForm, slotDurationMinutes: parseInt(e.target.value) || 30 })}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-darkNavy dark:text-white mb-1">OPD Opening Time *</label>
                          <input
                            type="text"
                            required
                            value={editSettingsForm.opdOpeningTime || '08:00 AM'}
                            onChange={(e) => setEditSettingsForm({ ...editSettingsForm, opdOpeningTime: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-darkNavy dark:text-white mb-1">OPD Closing Time *</label>
                          <input
                            type="text"
                            required
                            value={editSettingsForm.opdClosingTime || '08:00 PM'}
                            onChange={(e) => setEditSettingsForm({ ...editSettingsForm, opdClosingTime: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editSettingsForm.autoApproveDoctors || false}
                            onChange={(e) => setEditSettingsForm({ ...editSettingsForm, autoApproveDoctors: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span className="font-semibold text-darkNavy dark:text-slate-200">
                            Auto-approve new Doctor account registrations
                          </span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editSettingsForm.autoApproveStaff || false}
                            onChange={(e) => setEditSettingsForm({ ...editSettingsForm, autoApproveStaff: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span className="font-semibold text-darkNavy dark:text-slate-200">
                            Auto-approve new Hospital Staff account registrations
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowEditSettingsModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingSettings}
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-darkNavy font-black text-xs transition shadow-md disabled:opacity-60 cursor-pointer"
                        >
                          {savingSettings ? 'Saving...' : '💾 Save Configurations'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeNav === 'admin-profile' && (
            <AdminProfileView user={user} showNotify={showNotify} onLogoutRequest={() => setShowLogoutConfirm(true)} />
          )}

        </main>
      </div>

      {/* ADD DEPARTMENT MODAL */}
      {showAddDeptModal && (
        <AddDepartmentModal
          onClose={() => setShowAddDeptModal(false)}
          onAdded={(msg) => {
            fetchStats();
            if (activeNav === 'departments') loadDirectory('/admin/departments');
            if (msg) showNotify('success', 'Department Added', msg);
          }}
        />
      )}

      {/* INQUIRY DETAIL MODAL */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdateStatus={handleUpdateInquiryStatus}
          onDelete={(iq) => setDeletingInquiry(iq)}
        />
      )}

      {/* CONFIRM DELETE SINGLE INQUIRY MODAL */}
      {deletingInquiry && (
        <ConfirmDeleteInquiryModal
          inquiry={deletingInquiry}
          onClose={() => setDeletingInquiry(null)}
          onConfirm={confirmDeleteSingleInquiry}
          deleting={deletingInquiryProcess}
        />
      )}

      {/* CONFIRM DELETE ALL INQUIRIES MODAL */}
      {isDeletingAllInquiries && (
        <ConfirmDeleteAllInquiriesModal
          totalCount={inquiries.length}
          onClose={() => setIsDeletingAllInquiries(false)}
          onConfirm={confirmDeleteAllInquiries}
          deleting={deletingInquiryProcess}
        />
      )}

      {/* EDIT DEPARTMENT MODAL */}
      {editingDept && (
        <EditDepartmentModal
          dept={editingDept}
          onClose={() => setEditingDept(null)}
          onUpdated={(msg) => {
            fetchStats();
            if (activeNav === 'departments') loadDirectory('/admin/departments');
            if (msg) showNotify('success', 'Department Updated', msg);
          }}
        />
      )}

      {/* CONFIRM DELETE DEPARTMENT MODAL */}
      {deletingDept && (
        <ConfirmDeleteDeptModal
          dept={deletingDept}
          onClose={() => setDeletingDept(null)}
          onDeleted={(msg) => {
            fetchStats();
            if (activeNav === 'departments') loadDirectory('/admin/departments');
            showNotify('success', 'Department Deleted', msg || 'Department deleted successfully.');
          }}
        />
      )}

      {/* EDIT DOCTOR MODAL */}
      {editingDoctor && (
        <EditDoctorModal
          doctor={editingDoctor}
          onClose={() => setEditingDoctor(null)}
          onUpdated={(msg) => {
            fetchStats();
            if (activeNav === 'doctors') loadDirectory('/admin/doctors');
            if (msg) showNotify('success', 'Doctor Profile Updated', msg);
          }}
        />
      )}

      {/* APPROVAL CONFIRMATION MODAL */}
      {approvingItem && (
        <ApprovalConfirmModal
          itemObj={approvingItem.item}
          type={approvingItem.type}
          onClose={() => setApprovingItem(null)}
          onConfirm={executeApproval}
        />
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingItem && (
        <RejectionReasonModal
          itemObj={rejectingItem.item}
          type={rejectingItem.type}
          onClose={() => setRejectingItem(null)}
          onConfirm={(reason) => {
            executeRejection(reason);
            setRejectingItem(null);
          }}
        />
      )}
      {deletingDoctor && (
        <ConfirmDeleteDoctorModal
          doctor={deletingDoctor}
          onClose={() => setDeletingDoctor(null)}
          onDeleted={(msg) => {
            fetchStats();
            loadPending();
            if (activeNav === 'doctors') loadDirectory('/admin/doctors');
            showNotify('success', 'Doctor Deleted', msg || 'Doctor deleted successfully.');
          }}
        />
      )}

      {/* ADD STAFF MEMBER MODAL */}
      {showAddStaffModal && (
        <AddStaffModal
          onClose={() => setShowAddStaffModal(false)}
          onAdded={(msg) => {
            fetchStats();
            if (activeNav === 'staff') loadDirectory('/admin/receptionists');
            if (msg) showNotify('success', 'Staff Member Added', msg);
          }}
        />
      )}

      {/* EDIT STAFF MEMBER MODAL */}
      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onUpdated={(msg) => {
            fetchStats();
            if (activeNav === 'staff') loadDirectory('/admin/receptionists');
            if (msg) showNotify('success', 'Details Updated', msg);
          }}
        />
      )}

      {/* RBAC DESIGNATION & PERMISSIONS MODAL */}
      {rbacStaff && (
        <StaffRbacModal
          staff={rbacStaff}
          onClose={() => setRbacStaff(null)}
          onUpdated={(msg) => {
            fetchStats();
            if (activeNav === 'staff') loadDirectory('/admin/receptionists');
            if (msg) showNotify('success', 'RBAC Updated', msg);
          }}
        />
      )}

      {/* CONFIRM DELETE STAFF MODAL */}
      {deletingStaff && (
        <ConfirmDeleteStaffModal
          staff={deletingStaff}
          onClose={() => setDeletingStaff(null)}
          onDeleted={() => {
            fetchStats();
            if (activeNav === 'staff') loadDirectory('/admin/receptionists');
            showNotify('success', 'Staff Member Deleted', 'Staff member deleted successfully.');
          }}
        />
      )}

      {/* REJECT APPLICATION MODAL */}
      {rejectingItem && (
        <RejectModal
          item={rejectingItem.item}
          type={rejectingItem.type}
          onClose={() => setRejectingItem(null)}
          onConfirm={executeRejection}
        />
      )}
      {/* CREATE BROADCAST NOTICE MODAL */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                📢 Publish Hospital Notice
              </h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Notice Type *</label>
                <select
                  value={newNotice.type}
                  onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ANNOUNCEMENT">📢 Announcement</option>
                  <option value="EMERGENCY">🚨 Emergency Alert</option>
                  <option value="MAINTENANCE">🔧 Maintenance Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OPD Timings Changed for Tomorrow"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Broadcast Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the full broadcast message visible to all hospital users..."
                  value={newNotice.message}
                  onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs"
                >
                  📢 Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL ARTICLE PREVIEW MODAL (ADMIN) */}
      {viewingBlog && (
        <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setViewingBlog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-xl cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-white bg-primary px-3 py-1 rounded-full uppercase">
                {viewingBlog.category || 'General Health'}
              </span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                viewingBlog.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {viewingBlog.status}
              </span>
              {viewingBlog.showOnHome && (
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500 text-white uppercase">
                  🏠 Featured on Home
                </span>
              )}
            </div>

            <h3 className="font-poppins font-bold text-xl sm:text-2xl text-darkNavy dark:text-white leading-snug">
              {viewingBlog.title}
            </h3>

            <div className="flex items-center gap-2 text-xs font-bold text-darkNavy dark:text-slate-300 pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap">
              <span>✍️ {viewingBlog.author || 'Medical Team'} ({viewingBlog.role || 'Specialist'})</span>
              <span>•</span>
              <span>📅 {viewingBlog.createdAt ? new Date(viewingBlog.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
              <span>🕐 {viewingBlog.createdAt ? new Date(viewingBlog.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>

            {viewingBlog.image && (
              <img
                src={viewingBlog.image}
                alt={viewingBlog.title}
                className="w-full h-56 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs"
              />
            )}

            <div className="space-y-3 text-xs text-slateText dark:text-slate-300 leading-relaxed">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-darkNavy dark:text-white mb-1">📌 Short Summary / Excerpt:</p>
                <p>{viewingBlog.desc}</p>
              </div>

              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 space-y-2">
                <p className="font-bold text-primary dark:text-sky-300 text-sm">📖 Full Article Content & Guidance:</p>
                <FormattedArticleContent content={viewingBlog.fullText} />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const targetBlog = viewingBlog;
                  setViewingBlog(null);
                  openEditBlog(targetBlog);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                ✏️ Edit Article
              </button>
              <button
                onClick={() => setViewingBlog(null)}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOG CREATE / EDIT MODAL */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                {editingBlog ? '✏️ Edit Blog Article' : '📝 Write New Blog Article'}
              </h3>
              <button onClick={() => { setShowBlogModal(false); setEditingBlog(null); }} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 Essential Habits for a Healthy Heart"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Category *</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="General Health">General Health</option>
                    <option value="Heart Health">Heart Health</option>
                    <option value="Diabetes Awareness">Diabetes Awareness</option>
                    <option value="Child Care">Child Care</option>
                    <option value="Orthopedics & Spine">Orthopedics & Spine</option>
                    <option value="Emergency Care">Emergency Care</option>
                    <option value="Nutrition & Diet">Nutrition & Diet</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Women's Health">Women's Health</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Dental Care">Dental Care</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Status</label>
                  <select
                    value={blogForm.status}
                    onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                    className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="PUBLISHED">✅ Published</option>
                    <option value="DRAFT">📝 Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Short Description / Summary *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Brief summary of the article for card preview..."
                  value={blogForm.desc}
                  onChange={(e) => setBlogForm({ ...blogForm, desc: e.target.value })}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Full Article Content *</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Write or paste the complete blog article text here (formatting & paragraphs preserved)..."
                  value={blogForm.fullText}
                  onChange={(e) => setBlogForm({ ...blogForm, fullText: e.target.value })}
                  className="w-full whitespace-pre-wrap font-sans leading-relaxed text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Author Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ananya Sharma"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Author Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Cardiologist"
                    value={blogForm.role}
                    onChange={(e) => setBlogForm({ ...blogForm, role: e.target.value })}
                    className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={blogForm.image}
                  onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-darkNavy dark:text-white pt-1">
                  <input
                    type="checkbox"
                    checked={blogForm.showOnHome}
                    onChange={(e) => setBlogForm({ ...blogForm, showOnHome: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>🏠 Feature this article on the Home Page (Max 3 shown)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowBlogModal(false); setEditingBlog(null); }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  {editingBlog ? '✓ Save Changes' : '📝 Publish Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE BLOG MODAL */}
      {deletingBlog && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <span className="text-3xl">🗑️</span>
              <h3 className="font-poppins font-bold text-lg text-darkNavy dark:text-white">
                Delete Blog Article?
              </h3>
            </div>
            <p className="text-xs text-slateText dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-darkNavy dark:text-white">"{deletingBlog.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBlog(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBlog(deletingBlog._id)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs cursor-pointer"
              >
                🗑️ Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN REVIEW DOCTOR BLOG MODAL */}
      {reviewingBlog && (
        <AdminReviewBlogModal
          blog={reviewingBlog}
          onClose={() => setReviewingBlog(null)}
          onConfirm={(payload) => handleReviewBlog(reviewingBlog._id, 'PUBLISHED', payload)}
          onReject={(payload) => handleReviewBlog(reviewingBlog._id, 'REJECTED', payload)}
        />
      )}

      {/* SIGN OUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <ConfirmSignOutModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
        />
      )}

      {/* GENERAL NOTIFICATION MODAL */}
      {notifyPopup && (
        <NotificationModal
          isOpen={!!notifyPopup}
          type={notifyPopup.type}
          title={notifyPopup.title}
          message={notifyPopup.message}
          onClose={() => setNotifyPopup(null)}
        />
      )}
    </div>
  );
}

// Analytics & Performance Overview Chart Component
function AnalyticsOverviewChart({ allAppointments }) {
  const [timeRange, setTimeRange] = useState('DAY'); // 'DAY' | 'WEEK' | '3M' | '6M' | '1Y'

  const chartData = useMemo(() => {
    const now = new Date();
    const periods = [];

    // Helper to get YYYY-MM-DD in local time
    const toYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (timeRange === 'DAY') {
      // 7 Days Range (3 Days Ago, 2 Days Ago, Yesterday, Today, Tomorrow, +2 Days, +3 Days)
      for (let i = -3; i <= 3; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        const dateKey = toYMD(d);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateNum = d.getDate();
        const isToday = i === 0;
        periods.push({
          label: isToday ? 'Today' : `${dayName} ${dateNum}`,
          dateKey,
          count: 0,
        });
      }
    } else if (timeRange === 'WEEK') {
      // 4 Weeks Range (Wk -2, Last Wk, This Wk, Next Wk)
      for (let i = -2; i <= 1; i++) {
        const start = new Date(now);
        start.setDate(start.getDate() + i * 7 - 3);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setDate(end.getDate() + i * 7 + 3);
        end.setHours(23, 59, 59, 999);
        periods.push({
          label: i === 0 ? 'This Wk' : i === 1 ? 'Next Wk' : i === -1 ? 'Last Wk' : `Wk ${i}`,
          startTime: start.getTime(),
          endTime: end.getTime(),
          count: 0,
        });
      }
    } else if (['3M', '6M', '9M', '1Y'].includes(timeRange)) {
      const monthCount = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : timeRange === '9M' ? 9 : 12;
      for (let i = monthCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        periods.push({
          label: monthStr,
          monthKey,
          count: 0,
        });
      }
    }

    // Populate data from allAppointments
    (allAppointments || []).forEach((apt) => {
      let aptYMD = '';
      if (apt.appointmentDate && typeof apt.appointmentDate === 'string') {
        aptYMD = apt.appointmentDate.slice(0, 10);
      } else if (apt.createdAt) {
        aptYMD = toYMD(new Date(apt.createdAt));
      } else if (apt.date) {
        aptYMD = typeof apt.date === 'string' ? apt.date.slice(0, 10) : toYMD(new Date(apt.date));
      }
      if (!aptYMD) return;

      const aptDate = new Date(aptYMD + 'T12:00:00');

      if (timeRange === 'DAY') {
        const p = periods.find((x) => x.dateKey === aptYMD);
        if (p) p.count += 1;
      } else if (timeRange === 'WEEK') {
        const t = aptDate.getTime();
        const p = periods.find((x) => t >= x.startTime && t <= x.endTime);
        if (p) p.count += 1;
      } else {
        const monthKey = `${aptDate.getFullYear()}-${aptDate.getMonth()}`;
        const p = periods.find((x) => x.monthKey === monthKey);
        if (p) p.count += 1;
      }
    });

    return periods;
  }, [allAppointments, timeRange]);

  const totalPeriodBookings = useMemo(() => chartData.reduce((acc, d) => acc + d.count, 0), [chartData]);
  const maxValue = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-base sm:text-lg">
              Patient Bookings Analytics
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Live Data
            </span>
          </div>
          <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
            Real-time appointment volume trends across hospital departments.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-extrabold overflow-x-auto max-w-full">
          {[
            { id: 'DAY', label: 'Day-Wise' },
            { id: 'WEEK', label: 'Week-Wise' },
            { id: '3M', label: '3 Months' },
            { id: '6M', label: '6 Months' },
            { id: '1Y', label: '1 Year' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                timeRange === t.id
                  ? 'bg-white dark:bg-slate-700 text-primary dark:text-sky-300 shadow-xs'
                  : 'text-slate-500 hover:text-darkNavy dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slateText dark:text-slate-400 uppercase tracking-wider block">Selected View</span>
          <p className="font-bold text-darkNavy dark:text-white text-xs mt-0.5">
            {timeRange === 'DAY' ? '7 Days (Past & Upcoming)' : timeRange === 'WEEK' ? '4 Weeks (Past & Upcoming)' : `Last ${timeRange}`}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slateText dark:text-slate-400 uppercase tracking-wider block">Total Appointments</span>
          <p className="font-extrabold text-primary dark:text-sky-300 text-sm mt-0.5">
            {totalPeriodBookings} Patients
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slateText dark:text-slate-400 uppercase tracking-wider block">Peak Volume</span>
          <p className="font-extrabold text-darkNavy dark:text-white text-xs mt-0.5">
            {maxValue} Max / Slot
          </p>
        </div>
      </div>

      {/* Chart Visual Grid */}
      <div className="pt-1">
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-3 px-3 pt-8 pb-3 bg-slate-50/70 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {chartData.map((d, idx) => {
            const val = d.count;
            const heightPercent = maxValue > 0 ? Math.max((val / maxValue) * 85, 8) : 8;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                {/* Tooltip Hover Badge */}
                <div className="opacity-0 group-hover:opacity-100 transition duration-200 absolute -top-10 bg-darkNavy dark:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                  <span className="block font-semibold text-slate-300 text-[9px]">{d.label}</span>
                  {val} Bookings
                </div>

                {/* Value Label above Bar */}
                <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                  {val}
                </span>

                {/* Animated Gradient Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[42px] rounded-t-xl transition-all duration-500 shadow-2xs group-hover:brightness-110 bg-gradient-to-t from-primary via-indigo-600 to-indigo-400"
                />

                {/* Period X-Axis Label */}
                <span className="text-[11px] font-extrabold text-darkNavy dark:text-slate-300 mt-1 truncate max-w-[65px] text-center">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Sidebar Link Helper Component
function SidebarNavLink({ icon, label, badge, badgeColor, active, isAction, collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group cursor-pointer ${
        active
          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
          : isAction
          ? 'bg-sky-500/20 hover:bg-sky-500/30 text-white font-bold border border-sky-500/40'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
      }`}
    >
      <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center w-full' : ''}`}>
        <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'} shrink-0`}>
          {icon}
        </span>
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
      {!collapsed && badge != null && (
        <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full ${badgeColor || 'bg-sky-500'}`}>
          {badge}
        </span>
      )}
      {badge && collapsed && (
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      )}
    </button>
  );
}

// Add Department Modal
function AddDepartmentModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [consultationFee, setConsultationFee] = useState(500);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    setSaving(true);
    try {
      await axiosClient.post('/admin/departments', {
        name,
        description,
        consultationFee: Number(consultationFee) || 500,
        active,
      });
      // Broadcast event so public pages update in real-time across tabs/windows
      window.dispatchEvent(new CustomEvent('department_fee_changed'));
      localStorage.setItem('department_fee_changed', String(Date.now()));
      onAdded(`Department "${name}" created successfully with ₹${consultationFee} Consultation Fee!`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
            🏬 Add New Department
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Oncology Team or Neuro Surgery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Appointment Fee (₹) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                min="0"
                placeholder="500"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Detailed description of medical services & procedures provided..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-darkNavy dark:text-white pt-1">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span>🟢 Active Department Wing (Visible to patients)</span>
            </label>
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {saving ? 'Creating...' : '✓ Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Department Modal
function EditDepartmentModal({ dept, onClose, onUpdated }) {
  const [name, setName] = useState(dept.name || '');
  const [description, setDescription] = useState(dept.description || '');
  const [consultationFee, setConsultationFee] = useState(dept.consultationFee ?? 500);
  const [active, setActive] = useState(dept.active !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    setSaving(true);
    try {
      await axiosClient.put(`/admin/departments/${dept._id}`, {
        name,
        description,
        consultationFee: Number(consultationFee) || 500,
        active,
      });
      // Broadcast event so public pages update in real-time across tabs/windows
      window.dispatchEvent(new CustomEvent('department_fee_changed'));
      localStorage.setItem('department_fee_changed', String(Date.now()));
      onUpdated(`Department "${name}" details updated successfully!`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
            ✏️ Edit Department Details
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Appointment Fee (₹) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                min="0"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-darkNavy dark:text-white pt-1">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span>{active ? '🟢 Active Department Wing (Visible to patients)' : '🔴 Deactivated (Hidden from patients)'}</span>
            </label>
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {saving ? 'Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirm Delete Department Modal
function ConfirmDeleteDeptModal({ dept, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setError('');
    setDeleting(true);
    try {
      await axiosClient.delete(`/admin/departments/${dept._id}`);
      onDeleted(`Department "${dept.name}" deleted successfully.`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 text-center">
        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-xs">
          🗑️
        </div>

        <div className="space-y-1">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg">
            Delete Hospital Department?
          </h3>
          <p className="text-xs text-slateText dark:text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-darkNavy dark:text-white">"{dept.name}"</strong>?
          </p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl p-3 text-left space-y-1 text-xs text-rose-900 dark:text-rose-200">
          <p className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
            ⚠️ Warning:
          </p>
          <p className="text-[11px] text-rose-800 dark:text-rose-300">
            • Department: <strong>{dept.name}</strong><br />
            • Fee: <strong>₹{dept.consultationFee ?? 500}</strong>
          </p>
        </div>

        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {deleting ? 'Deleting...' : '🗑️ Yes, Delete Department'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Doctor Profile Modal
function EditDoctorModal({ doctor, onClose, onUpdated }) {
  const originalEmail = doctor.user?.email || doctor.email || '';
  const [fullName, setFullName] = useState(doctor.user?.fullName || '');
  const [email, setEmail] = useState(originalEmail);
  const [phone, setPhone] = useState(doctor.user?.phone || '');
  const [specialization, setSpecialization] = useState(doctor.specialization || '');
  const [qualification, setQualification] = useState(doctor.qualification || '');
  const [experienceYears, setExperienceYears] = useState(doctor.experienceYears ?? 5);
  const [consultationFee, setConsultationFee] = useState(doctor.consultationFee ?? 500);
  const [availabilitySchedule, setAvailabilitySchedule] = useState(doctor.availabilitySchedule || 'MON - FRI • 09:00 AM - 01:00 PM');

  // Email OTP state
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleEmailChange(val) {
    setEmail(val);
    if (val.trim().toLowerCase() !== originalEmail.trim().toLowerCase()) {
      setIsEmailVerified(false);
      setOtpSent(false);
      setOtpMessage('');
    } else {
      setIsEmailVerified(true);
      setOtpSent(false);
      setOtpMessage('');
    }
  }

  async function handleSendEmailOtp() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setError('');
    setSendingOtp(true);
    try {
      const res = await axiosClient.post('/doctor/request-email-change-otp', {
        doctorId: doctor._id,
        newEmail: email,
      });
      setOtpSent(true);
      setOtpMessage(`📩 ${res.data.message} ${res.data.otpCode ? `(Dev Code: ${res.data.otpCode})` : ''}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email verification OTP.');
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyEmailOtp() {
    if (!otpCodeInput || otpCodeInput.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setError('');
    setVerifyingOtp(true);
    try {
      await axiosClient.post('/doctor/verify-email-change-otp', {
        doctorId: doctor._id,
        newEmail: email,
        otp: otpCodeInput,
      });
      setIsEmailVerified(true);
      setOtpSent(false);
      setOtpMessage('✅ New email address verified successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (email.trim().toLowerCase() !== originalEmail.trim().toLowerCase() && !isEmailVerified) {
      setError('Please verify your new email address via OTP before saving.');
      return;
    }

    setSaving(true);
    try {
      await axiosClient.put(`/admin/doctors/${doctor._id}`, {
        fullName,
        email,
        phone,
        specialization,
        qualification,
        experienceYears: Number(experienceYears) || 0,
        consultationFee: Number(consultationFee) || 500,
        availabilitySchedule,
      });
      onUpdated(`Doctor "Dr. ${fullName}" profile details updated successfully!`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
            ✏️ Edit Doctor Profile
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Full Name (Dr.) *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">
                Email Address * {isEmailVerified && email.toLowerCase() !== originalEmail.toLowerCase() && <span className="text-emerald-600 font-bold">✓ Verified</span>}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
              />
            </div>
          </div>

          {/* Email OTP Verification Block */}
          {email.trim().toLowerCase() !== originalEmail.trim().toLowerCase() && (
            <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                  🔑 Email Address Verification Required
                </span>
                {isEmailVerified && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                    VERIFIED ✅
                  </span>
                )}
              </div>

              {!isEmailVerified && !otpSent && (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={sendingOtp}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 rounded-xl transition shadow-2xs"
                >
                  {sendingOtp ? 'Sending OTP...' : '📩 Request OTP to Verify New Email'}
                </button>
              )}

              {otpSent && !isEmailVerified && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCodeInput}
                    onChange={(e) => setOtpCodeInput(e.target.value)}
                    className="w-full text-center text-sm font-mono font-bold border border-amber-300 rounded-xl py-2 bg-white text-amber-950"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={verifyingOtp}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition shadow-2xs"
                  >
                    {verifyingOtp ? 'Verifying OTP...' : '✓ Verify OTP & Confirm Email'}
                  </button>
                </div>
              )}

              {otpMessage && (
                <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">{otpMessage}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Specialization *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardiology"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Hospital Department</label>
              <input
                type="text"
                readOnly
                value={doctor.department?.name || specialization || 'General Medicine'}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-not-allowed"
                title="Department & fees are managed in Departments Directory"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Medical Qualification *</label>
              <input
                type="text"
                required
                placeholder="e.g. MBBS, MD (Cardiology)"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Experience (Years) *</label>
              <input
                type="number"
                required
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-bold"
              />
            </div>
          </div>

          <OpdSchedulePicker
            value={availabilitySchedule}
            onChange={setAvailabilitySchedule}
          />

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {saving ? 'Saving...' : '✓ Save Doctor Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirm Delete Doctor Modal
function ConfirmDeleteDoctorModal({ doctor, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const rawDocName = (doctor.user?.fullName || doctor.fullName || '').replace(/^dr\.\s+/i, '').trim();
  const docName = rawDocName ? `Dr. ${rawDocName}` : 'Specialist Doctor';

  async function handleDelete() {
    setError('');
    setDeleting(true);
    try {
      await axiosClient.delete(`/admin/doctors/${doctor._id}`);
      onDeleted(`Doctor "${docName}" deleted successfully.`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor profile.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 text-center">
        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-xs">
          🗑️
        </div>

        <div className="space-y-1">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg">
            Delete Doctor Profile?
          </h3>
          <p className="text-xs text-slateText dark:text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-darkNavy dark:text-white">{docName}</strong>?
          </p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl p-3 text-left space-y-1 text-xs text-rose-900 dark:text-rose-200">
          <p className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
            ⚠️ Warning:
          </p>
          <p className="text-[11px] text-rose-800 dark:text-rose-300">
            • Doctor: <strong>{docName}</strong><br />
            • Email: <strong>{doctor.user?.email || '—'}</strong><br />
            • Specialization: <strong>{doctor.specialization || 'General Medicine'}</strong>
          </p>
        </div>

        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {deleting ? 'Deleting...' : '🗑️ Yes, Delete Doctor'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Live Digital Clock & Date Widget
function HeaderClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="h-10 hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs transition-colors whitespace-nowrap shrink-0">
      <span className="text-amber-500 font-bold text-xs animate-pulse">⏰</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-extrabold text-darkNavy dark:text-sky-300 tracking-wider text-xs">
          {timeStr}
        </span>
        <span className="text-slate-400 font-extrabold text-xs">•</span>
        <span className="text-xs font-bold text-darkNavy dark:text-white">
          {dateStr}
        </span>
      </div>
    </div>
  );
}

// Dark / Light Theme Toggle Switch
function ThemeToggleBtn({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="h-9 sm:h-10 flex items-center justify-center gap-1.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-darkNavy dark:text-amber-300 border border-slate-200 dark:border-slate-700 text-xs font-extrabold transition active:scale-95 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
    >
      <span>{isDark ? '🌙' : '☀️'}</span>
      <span className="hidden sm:inline font-bold">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN PROFILE VIEW — Full profile page with edit & password change
// ═══════════════════════════════════════════════════════
function AdminProfileView({ user, showNotify, onLogoutRequest }) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Password change state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);

  // Dynamic Password Match Progress Calculation
  const matchPercentage = useMemo(() => {
    if (!confirmPwd && !newPwd) return 0;
    if (!confirmPwd || !newPwd) return 0;
    if (confirmPwd === newPwd) return 100;
    let matches = 0;
    const maxLen = Math.max(newPwd.length, confirmPwd.length);
    for (let i = 0; i < Math.min(newPwd.length, confirmPwd.length); i++) {
      if (newPwd[i] === confirmPwd[i]) matches++;
    }
    return Math.round((matches / maxLen) * 100);
  }, [newPwd, confirmPwd]);

  const isMatched = newPwd.length > 0 && confirmPwd.length > 0 && newPwd === confirmPwd;

  async function handleToggle2FA() {
    setToggling2FA(true);
    try {
      const res = await axiosClient.put('/auth/toggle-2fa');
      setProfile((prev) => ({ ...prev, twoFactorEnabled: res.data.twoFactorEnabled }));
      showNotify('success', '2FA Settings Updated', res.data.message);
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to toggle 2FA.');
    } finally {
      setToggling2FA(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/profile');
      if (res.data) {
        setProfile(res.data);
        setEditName(res.data.fullName || user?.fullName || '');
        setEditPhone(res.data.phone || user?.phone || '');
      } else {
        setProfile(user || { fullName: 'Hospital Admin', email: 'admin@brainwarehospital.com', role: 'ADMIN' });
        setEditName(user?.fullName || 'Hospital Admin');
        setEditPhone(user?.phone || '');
      }
    } catch (err) {
      console.error('Failed to fetch admin profile:', err);
      setProfile(user || { fullName: 'Hospital Admin', email: 'admin@brainwarehospital.com', role: 'ADMIN' });
      setEditName(user?.fullName || 'Hospital Admin');
      setEditPhone(user?.phone || '');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!editName.trim()) {
      showNotify('error', 'Validation', 'Full name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await axiosClient.put('/admin/profile', {
        fullName: editName.trim(),
        phone: editPhone.trim(),
      });
      if (res.data?.admin) {
        setProfile((prev) => ({ ...prev, ...res.data.admin }));
      }
      setEditMode(false);
      showNotify('success', 'Profile Updated', res.data.message);
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setPwdError('');
    if (!currentPwd || !newPwd) {
      setPwdError('Both fields are required.');
      return;
    }
    if (newPwd.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match.');
      return;
    }
    setPwdSaving(true);
    try {
      const res = await axiosClient.put('/admin/profile/password', {
        currentPassword: currentPwd,
        newPassword: newPwd,
      });
      if (res.data?.passwordHistory || res.data?.passwordChangeHistory) {
        const historyList = res.data.passwordHistory || res.data.passwordChangeHistory;
        setProfile((prev) => ({
          ...prev,
          updatedAt: res.data.updatedAt,
          passwordHistory: historyList,
          passwordChangeHistory: historyList,
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          updatedAt: res.data.updatedAt,
          passwordHistory: [...(prev?.passwordHistory || prev?.passwordChangeHistory || []), { changedAt: new Date(), ipAddress: '127.0.0.1' }],
        }));
      }
      showNotify('success', 'Password Changed', res.data.message);
      setShowPwdModal(false);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = (profile?.fullName || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();


  const lastUpdated = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  const pwdHistory = profile?.passwordHistory || profile?.passwordChangeHistory || [];

  return (
    <div className="space-y-6 w-full animate-page-slide-left">

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden w-full">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left min-w-0 flex-1">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-purple-600 text-white font-poppins font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/10 shrink-0">
              {initials}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <h2 className="font-poppins font-extrabold text-white text-lg sm:text-xl tracking-tight truncate">
                {profile?.fullName || 'Hospital Administration'}
              </h2>
              
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                <span className="font-mono text-slate-200">📧 {profile?.email || 'admin@brainwarehospital.com'}</span>
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline">Signed in as Lead System Administrator</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Last updated {lastUpdated}
              </p>
            </div>
          </div>

          {/* Right Side Badges (Super Admin & Active Account) */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end shrink-0">
            <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
              👑 SUPER ADMIN
            </span>
            <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
              ✓ ACTIVE ACCOUNT
            </span>
          </div>

        </div>
      </div>

      {/* Main Balanced 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* LEFT COLUMN: Profile & System Permissions */}
        <div className="space-y-6 flex flex-col">

          {/* Personal Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                <span>👤 Personal & Contact Profile</span>
              </h3>
              {!editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primaryDark text-white font-bold text-xs shadow-2xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✏️ Edit Information</span>
                </button>
              )}
            </div>

            {!editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slateText dark:text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <p className="font-bold text-darkNavy dark:text-white text-sm">{profile?.fullName || '—'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slateText dark:text-slate-400 uppercase tracking-wider block">Phone Contact</span>
                  <p className="font-mono font-bold text-darkNavy dark:text-white text-sm">{profile?.phone || '—'}</p>
                </div>
                <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slateText dark:text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <p className="font-mono font-bold text-darkNavy dark:text-white text-sm break-all">{profile?.email || '—'}</p>
                </div>
              </div>
            ) : (
              /* Inline Edit Mode Form */
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-bold focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-bold focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : '✓ Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Note regarding Admin Email */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slateText dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
              <span className="text-amber-500 text-sm shrink-0">🔒</span>
              <p className="text-[11px] leading-relaxed">
                <strong className="text-darkNavy dark:text-slate-200 font-bold">Security Note:</strong> Administrator email address cannot be changed directly to preserve system audit logs & security access control.
              </p>
            </div>
          </div>

          {/* Two-Factor Authentication (2FA) Card Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 flex-1 flex flex-col justify-between">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                <span>🛡️ Two-Factor Authentication (2FA)</span>
              </h3>
              <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                Add an additional layer of security to your admin account.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <h4 className="text-xs font-bold text-darkNavy dark:text-white">Email OTP Verification</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      {profile?.twoFactorEnabled
                        ? '2FA is active. A 6-digit code is sent via email during login.'
                        : '2FA is disabled. Enable to secure your login.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggle2FA}
                  disabled={toggling2FA}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 shrink-0 ${
                    profile?.twoFactorEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {toggling2FA
                    ? 'Updating...'
                    : profile?.twoFactorEnabled
                    ? '🟢 Enabled'
                    : '🔴 Disabled'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Security Status & Password Reset */}
        <div className="space-y-6 flex flex-col">

          {/* Account Security Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                <span>🔐 Security & Authentication Status</span>
              </h3>
            </div>

            <div className="space-y-3">

              {/* Password Change Section */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🔑</span>
                    <span className="text-xs font-bold text-darkNavy dark:text-white">Password Management</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPwdError(''); setShowPwdModal(true); }}
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <KeyRound size={13} />
                    <span>Change Password</span>
                  </button>
                </div>

                <p className="text-[10px] text-rose-700 dark:text-rose-400 leading-relaxed">
                  Regularly update your admin password for enhanced account protection.
                </p>

                {/* Masked Password Display */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/70 dark:border-rose-800/50">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Password</span>
                    <p className="font-mono text-sm font-extrabold text-darkNavy dark:text-white tracking-[0.2em] mt-0.5">
                      *******************
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                    🔒 Encrypted
                  </span>
                </div>

                {/* Last Password Changed Record */}
                {(() => {
                  const latestChange = pwdHistory.length > 0 ? pwdHistory[pwdHistory.length - 1] : null;
                  return (
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/70 dark:border-rose-800/50 space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🕒 Last Password Change</span>
                      </div>

                      {latestChange ? (
                        <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
                          <span className="font-bold text-darkNavy dark:text-white">
                            {new Date(latestChange.changedAt || latestChange).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                          {latestChange.ipAddress && (
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              IP: {latestChange.ipAddress}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                          No password change recorded yet.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Change Password Modal */}
              {showPwdModal && (
                <div className="fixed inset-0 z-[90] bg-darkNavy/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 overflow-y-auto animate-fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 my-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                          <span>🔑</span>
                          <span>Change Password</span>
                        </h3>
                        <p className="text-[11px] text-slateText dark:text-slate-400 mt-0.5">
                          Update your admin account password securely.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShowPwdModal(false); setPwdError(''); }}
                        className="text-slate-400 hover:text-darkNavy dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-darkNavy dark:text-white">Current Password *</label>
                          <Link
                            to="/forgot-password"
                            className="text-[11px] font-bold text-sky-500 hover:text-sky-600 hover:underline cursor-pointer"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                        <div className="relative">
                          <input
                            type={showCurrentPwd ? 'text' : 'password'}
                            value={currentPwd}
                            onChange={(e) => setCurrentPwd(e.target.value)}
                            className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-darkNavy dark:text-white font-mono pr-10 focus:ring-2 focus:ring-primary/20"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                          >
                            {showCurrentPwd ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">New Password *</label>
                          <div className="relative">
                            <input
                              type={showNewPwd ? 'text' : 'password'}
                              value={newPwd}
                              onChange={(e) => setNewPwd(e.target.value)}
                              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-darkNavy dark:text-white font-mono pr-10 focus:ring-2 focus:ring-primary/20"
                              placeholder="Min 6 chars"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPwd(!showNewPwd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                            >
                              {showNewPwd ? '🙈' : '👁️'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Confirm Password *</label>
                          <input
                            type="password"
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                            className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-darkNavy dark:text-white font-mono focus:ring-2 focus:ring-primary/20"
                            placeholder="Re-enter new password"
                          />
                        </div>
                      </div>

                      {/* Password Match Progress Bar with Percentage (Only visible when typing confirm password) */}
                      {confirmPwd.length > 0 && (
                        <div className="space-y-1 mt-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className={isMatched ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                              {isMatched ? '✓ Passwords Match' : 'Password Mismatch'}
                            </span>
                            <span className={isMatched ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-rose-600 dark:text-rose-400 font-extrabold'}>
                              {matchPercentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                isMatched
                                  ? 'bg-emerald-500 shadow-xs'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${matchPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {pwdError && (
                        <p className="text-xs text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2">
                          ⚠️ {pwdError}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => { setShowPwdModal(false); setPwdError(''); }}
                          className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          disabled={pwdSaving}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
                        >
                          {pwdSaving ? 'Changing...' : '🔐 Update Password'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Session & Sign Out Card Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 flex-1 flex flex-col justify-between">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                <span>🚪 Account Session & Sign Out</span>
              </h3>
              <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                Safely terminate your active administrator session.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🚪</span>
                  <div>
                    <h4 className="text-xs font-bold text-darkNavy dark:text-white">Active Session</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Logged in as <span className="font-mono font-bold text-darkNavy dark:text-white">{profile?.email || user?.email}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { if (onLogoutRequest) onLogoutRequest(); else logout(); }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>🚪 Sign Out</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// User Profile Logo & Role Badge Widget with 2-Option Dropdown (Profile & Logout)
function UserProfileBadgeWidget({ user, fallbackRole = 'ADMIN', onProfileClick, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const roleUpper = (user?.role || fallbackRole).toUpperCase();
  const name = user?.fullName || (roleUpper === 'ADMIN' ? 'Hospital Admin' : 'User Account');

  let roleBadge = null;
  if (roleUpper === 'ADMIN') {
    roleBadge = (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 uppercase">
        👑 Admin
      </span>
    );
  } else if (roleUpper === 'STAFF') {
    roleBadge = (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 uppercase">
        📋 Staff Member
      </span>
    );
  } else if (roleUpper === 'DOCTOR') {
    roleBadge = (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 uppercase">
        🩺 Doctor
      </span>
    );
  } else {
    roleBadge = (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 uppercase">
        👤 Customer / Patient
      </span>
    );
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="h-10 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1 rounded-2xl shadow-2xs transition-colors hover:ring-2 hover:ring-primary/30 cursor-pointer"
        title="Account Options"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-poppins font-extrabold text-xs flex items-center justify-center shadow-xs">
          {initials}
        </div>
        <div className="flex flex-col text-left leading-tight hidden xs:flex">
          <span className="font-poppins font-bold text-darkNavy dark:text-white text-xs truncate max-w-[120px]">
            {name}
          </span>
          <div className="mt-0.5">{roleBadge}</div>
        </div>
      </button>

      {/* 2-Option Dropdown Menu (Profile & Logout) */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn z-50 space-y-1">
            {/* Option 1: Profile */}
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                if (onProfileClick) onProfileClick();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-darkNavy dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <span>👤</span>
              <span>Profile</span>
            </button>

            {/* Option 2: Logout */}
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, gradient, borderColor, textColor, badge }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} bg-white dark:bg-slate-900 rounded-2xl p-5 border ${borderColor} dark:border-slate-800 shadow-card relative overflow-hidden transition-colors`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs text-slateText dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {badge}
        </span>
      </div>
      <p className={`font-poppins font-extrabold text-2xl sm:text-3xl ${textColor} dark:text-white`}>
        {value ?? '—'}
      </p>
      <p className="text-xs font-semibold text-slateText dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function QuickCard({ icon, title, desc, onClick, actionText, highlight }) {
  return (
    <div className={`rounded-2xl p-5 border shadow-card flex flex-col justify-between gap-3 transition ${
      highlight ? 'bg-gradient-to-br from-primary/10 to-indigo-500/5 dark:from-primary/20 dark:to-indigo-500/10 border-primary/30 dark:border-primary/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      <div className="space-y-1">
        <span className="text-2xl block">{icon}</span>
        <h4 className="font-poppins font-bold text-darkNavy dark:text-white text-sm">{title}</h4>
        <p className="text-xs text-slateText dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={onClick}
        className={`text-xs font-bold py-2 rounded-xl transition text-center ${
          highlight ? 'bg-primary text-white shadow-xs hover:bg-primaryDark' : 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-slate-700'
        }`}
      >
        {actionText} →
      </button>
    </div>
  );
}

function formatDateDDMMYYYY(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function format12HourTime(str) {
  if (!str) return '';
  return str.replace(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/g, (match, hh, mm) => {
    let hours = parseInt(hh, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    return `${hoursStr}:${mm} ${ampm}`;
  });
}

function parseAvailabilityScheduleLines(rawStr) {
  if (!rawStr || !rawStr.trim()) {
    return ['MON - FRI • 09:00 AM - 01:00 PM'];
  }

  const parts = rawStr.split(/[,;\n|]+/).map(p => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    return ['MON - FRI • 09:00 AM - 01:00 PM'];
  }

  return parts.map(part => {
    let formatted = part.replace(/^([A-Za-z\s-]+):/, '$1 • ');
    formatted = format12HourTime(formatted);
    return formatted.replace(/\s*-\s*/g, ' - ');
  });
}

function StatusBadge({ status, isLeave }) {
  if (isLeave) {
    return (
      <span className="text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
        🏖️ ON LEAVE
      </span>
    );
  }
  if (status === 'APPROVED' || status === 'ACCEPTED') {
    return (
      <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        APPROVED
      </span>
    );
  }
  if (status === 'ACTIVE') {
    return (
      <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        ACTIVE
      </span>
    );
  }
  if (status === 'DEACTIVE' || status === 'DEACTIVATED' || status === 'INACTIVE') {
    return (
      <span className="text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
        DEACTIVE
      </span>
    );
  }
  if (status === 'REJECTED' || status === 'CANCELLED') {
    return (
      <span className="text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
        ✕ {status}
      </span>
    );
  }
  if (status === 'COMPLETED') {
    return (
      <span className="text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
        ✓ COMPLETED
      </span>
    );
  }
  return (
    <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
      ⏳ PENDING
    </span>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="py-10 text-center space-y-2">
      <span className="text-3xl block">{icon}</span>
      <p className="text-xs font-medium text-slateText">{message}</p>
    </div>
  );
}

function getDeptIcon(name = '') {
  const n = name.toLowerCase().trim();
  if (n.includes('anesthes') || n.includes('pain')) return '💉';
  if (n.includes('cardiothoracic') || n.includes('cardio thoracic')) return '🫀';
  if (n.includes('cardio')) return '❤️';
  if (n.includes('child guidance')) return '🧸';
  if (n.includes('paediatric nephro') || n.includes('pediatric nephro')) return '💧';
  if (n.includes('paediatric ortho') || n.includes('pediatric ortho')) return '🩼';
  if (n.includes('paediatric surg') || n.includes('pediatric surg')) return '🍼';
  if (n.includes('paediatric') || n.includes('pediatric') || n.includes('child')) return '🚼';
  if (n.includes('nutrition') || n.includes('diet')) return '🥗';
  if (n.includes('critical') || n.includes('icu')) return '🚨';
  if (n.includes('dent')) return '🦷';
  if (n.includes('derm')) return '🧴';
  if (n.includes('diabet') || n.includes('endo')) return '🧪';
  if (n.includes('ent')) return '👂';
  if (n.includes('emergency') || n.includes('trauma')) return '🚑';
  if (n.includes('gastro surg')) return '🔪';
  if (n.includes('gastro')) return '🫄';
  if (n.includes('geriatric')) return '👨‍🦳';
  if (n.includes('gynae onco')) return '🎀';
  if (n.includes('gynae') || n.includes('obste') || n.includes('women')) return '🤰';
  if (n.includes('thalass') || n.includes('haemoglob')) return '🧬';
  if (n.includes('haemat') || n.includes('hemat')) return '🩸';
  if (n.includes('immuno') || n.includes('allergy')) return '🌿';
  if (n.includes('infect')) return '🦠';
  if (n.includes('nephro')) return '💧';
  if (n.includes('neuro surg') || n.includes('neurosurg')) return '⚡';
  if (n.includes('neuro')) return '🧠';
  if (n.includes('nuclear') || n.includes('pet scan')) return '☢️';
  if (n.includes('onco surg')) return '✂️';
  if (n.includes('radiation onco')) return '📡';
  if (n.includes('onco') || n.includes('cancer')) return '🎗️';
  if (n.includes('ophthal')) return '👁️';
  if (n.includes('ortho')) return '🦴';
  if (n.includes('pathol') || n.includes('lab')) return '🔬';
  if (n.includes('physic') || n.includes('rehab')) return '🏋️';
  if (n.includes('plast')) return '🩹';
  if (n.includes('psych')) return '🗣️';
  if (n.includes('pulmo') || n.includes('resp') || n.includes('lung')) return '🫁';
  if (n.includes('radiol') || n.includes('imaging') || n.includes('x-ray')) return '🩻';
  if (n.includes('reproduc') || n.includes('ivf')) return '🧫';
  if (n.includes('rheum')) return '🤲';
  if (n.includes('uro')) return '🚿';
  if (n.includes('vascul')) return '💓';
  if (n.includes('surg')) return '🔪';
  if (n.includes('medicine')) return '🩺';
  return '🏥';
}

// Add Staff Member Modal
function AddStaffModal({ onClose, onAdded }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Staff@123');
  const [designation, setDesignation] = useState('RECEPTIONIST');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    setSaving(true);
    try {
      await axiosClient.post('/admin/staff', {
        fullName,
        email,
        phone,
        password,
        designation,
      });
      onAdded(`Staff Member "${fullName}" created as ${designation} successfully!`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff member.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
            📋 Add Hospital Staff Member
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amitabh Sen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. staff@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Account Password *</label>
            <input
              type="text"
              required
              placeholder="e.g. Staff@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Operational Designation / Role *</label>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-semibold"
            >
              <option value="RECEPTIONIST">📋 Receptionist (General OPD Reception)</option>
              <option value="OPD_DESK">🩺 OPD Desk (Token Counter & Queue)</option>
              <option value="OPERATION_THEATER">✂️ Operation Theater (OT & Surgical Desk)</option>
              <option value="BILLING_DESK">💳 Billing Desk (Cashier & Receipts)</option>
              <option value="PHARMACY_DESK">💊 Pharmacy Desk (Prescriptions)</option>
              <option value="PATIENT_CARE">💬 Patient Care (Support & Helpdesk)</option>
            </select>
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {saving ? 'Creating...' : '✓ Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Staff Member Modal
function EditStaffModal({ staff, onClose, onUpdated }) {
  const initialDesignation = ['RECEPTIONIST', 'OPD_DESK', 'OPERATION_THEATER', 'BILLING_DESK', 'PHARMACY_DESK', 'PATIENT_CARE'].includes(staff.designation)
    ? staff.designation
    : 'RECEPTIONIST';

  const [fullName, setFullName] = useState(staff.user?.fullName || '');
  const [email, setEmail] = useState(staff.user?.email || '');
  const [phone, setPhone] = useState(staff.user?.phone || '');
  const [designation, setDesignation] = useState(initialDesignation);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    setSaving(true);
    try {
      await axiosClient.put(`/admin/staff/${staff._id}`, {
        fullName,
        email,
        phone,
        designation,
      });
      onUpdated(`Staff Member "${fullName}" details updated successfully!`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update staff member.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
            ✏️ Edit Staff Member Details
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Operational Designation / Role *</label>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-semibold"
            >
              <option value="RECEPTIONIST">📋 Receptionist (General OPD Reception)</option>
              <option value="OPD_DESK">🩺 OPD Desk (Token Counter & Queue)</option>
              <option value="OPERATION_THEATER">✂️ Operation Theater (OT & Surgical Desk)</option>
              <option value="BILLING_DESK">💳 Billing Desk (Cashier & Receipts)</option>
              <option value="PHARMACY_DESK">💊 Pharmacy Desk (Prescriptions)</option>
              <option value="PATIENT_CARE">💬 Patient Care (Support & Helpdesk)</option>
            </select>
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {saving ? 'Saving...' : '✓ Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirm Delete Staff Member Modal
function ConfirmDeleteStaffModal({ staff, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const staffName = staff.user?.fullName || 'Staff Member';

  async function handleDelete() {
    setError('');
    setDeleting(true);
    try {
      await axiosClient.delete(`/admin/staff/${staff._id}`);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member.');
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 text-center">
        {/* Warning Badge Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800 shadow-xs">
          ⚠️
        </div>

        <div className="space-y-1">
          <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg">
            Delete Staff Member?
          </h3>
          <p className="text-xs text-slateText dark:text-slate-300">
            Are you sure you want to permanently delete <strong className="text-darkNavy dark:text-white">{staffName}</strong>?
          </p>
        </div>

        {/* Staff Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
          <p className="flex justify-between">
            <span className="text-slate-400 dark:text-slate-400">Assigned Desk:</span>
            <span className="font-bold text-indigo-900 dark:text-sky-300">{staff.deskNumber || 'Desk 1 - Reception Main'}</span>
          </p>
          {staff.user?.email && (
            <p className="flex justify-between">
              <span className="text-slate-400 dark:text-slate-400">Email:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{staff.user.email}</span>
            </p>
          )}
        </div>

        {/* Red Warning Banner */}
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-[11px] text-rose-800 dark:text-rose-300 text-left font-medium">
          🚨 <strong>Warning:</strong> This will permanently delete their login account and remove all desk assignments. This action cannot be undone.
        </div>

        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

        {/* Modal Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {deleting ? 'Deleting...' : '🗑️ Yes, Delete Staff'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom Rejection Reason Modal
function RejectModal({ item, type, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const name = item?.user?.fullName || (type === 'doctor' ? 'Doctor' : 'Staff Member');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await onConfirm(reason);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
            ⚠️ Reject Application
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <p className="text-xs text-slateText dark:text-slate-300">
          Please provide a reason for rejecting <strong className="text-darkNavy dark:text-white">{name}</strong>'s application.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Rejection Reason *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Incomplete credentials verification..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Custom Notification Popup Modal Component
function NotificationModal({ isOpen, type = 'success', title, message, onClose }) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4 text-center">
        <div className={`w-14 h-14 rounded-2xl text-2xl flex items-center justify-center mx-auto shadow-xs border ${
          isSuccess ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
        }`}>
          {isSuccess ? '✅' : '⚠️'}
        </div>

        <div className="space-y-1">
          <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg">
            {title || (isSuccess ? 'Action Successful' : 'Action Failed')}
          </h3>
          <p className="text-xs text-slateText dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`w-full font-bold text-xs py-2.5 rounded-xl transition shadow-xs ${
            isSuccess ? 'bg-primary hover:bg-primaryDark text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          OK, Got It
        </button>
      </div>
    </div>
  );
}

// Confirm Sign Out Modal Component
function ConfirmSignOutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-[70] animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4 text-center">
        {/* Sign Out Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800 shadow-xs">
          <LogOut className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg">
            Confirm Sign Out?
          </h3>
          <p className="text-xs text-slateText dark:text-slate-400 leading-relaxed">
            Are you sure you want to end your current session and sign out of the hospital portal?
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Inquiry Detail & Response Modal
function InquiryDetailModal({ inquiry, onClose, onUpdateStatus, onDelete }) {
  const ticketCode = `#TKT-${inquiry._id.slice(-6).toUpperCase()}`;
  const dateStr = new Date(inquiry.createdAt || Date.now()).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const mailtoUrl = `mailto:${inquiry.email}?subject=RE:%20Inquiry%20Ticket%20${ticketCode}%20-%20Brainware%20Hospital&body=Dear%20${encodeURIComponent(inquiry.fullName)},%0A%0AThank%20you%20for%20contacting%20Brainware%20Medical%20College%20%26%20Hospital.%0A%0ARegarding%20your%20inquiry%20(Ticket%20${ticketCode}):%0A"${encodeURIComponent(inquiry.message)}"%0A%0A[Type%20your%20response%20here]%0A%0ABest%20regards,%0APatient%20Support%20Desk%0ABrainware%20Hospital`;

  return (
    <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto text-darkNavy dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-indigo-600 dark:text-sky-300 text-sm">
                {ticketCode}
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                inquiry.status === 'RESOLVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : inquiry.status === 'IN_PROGRESS'
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {inquiry.status || 'NEW'}
              </span>
            </div>
            <h3 className="font-poppins font-bold text-lg text-darkNavy dark:text-white mt-1">
              Patient Inquiry Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Patient Contact Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Patient Name</span>
            <span className="font-bold text-darkNavy dark:text-white text-sm">{inquiry.fullName}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone Number</span>
            <span className="font-bold text-darkNavy dark:text-white font-mono text-sm">{inquiry.phone || '—'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 col-span-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
            <span className="font-bold text-indigo-600 dark:text-white text-xs font-mono">{inquiry.email}</span>
          </div>
        </div>

        {/* Subject & Submission Date */}
        <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-200">Category / Subject:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-white text-[11px]">{dateStr}</span>
          </div>
          <p className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">
            📌 {inquiry.subject || 'General Inquiry'}
          </p>
        </div>

        {/* Full Message Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Patient Inquiry Message:
          </label>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-darkNavy dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-medium">
            "{inquiry.message}"
          </div>
        </div>

        {/* Status Change Selector */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Update Ticket Status:
          </label>
          <div className="flex gap-2">
            {[
              { id: 'NEW', label: '⚠️ Mark New' },
              { id: 'IN_PROGRESS', label: '⏳ Mark In Progress' },
              { id: 'RESOLVED', label: '✅ Mark Resolved' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onUpdateStatus(inquiry._id, st.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  (inquiry.status || 'NEW') === st.id
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
          <button
            type="button"
            onClick={() => onDelete(inquiry)}
            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            🗑️ Delete Ticket
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            <a
              href={mailtoUrl}
              className="bg-primary hover:bg-primaryDark text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>✉️</span>
              <span>Send Email Reply</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Single Inquiry Delete Confirmation Modal
function ConfirmDeleteInquiryModal({ inquiry, onClose, onConfirm, deleting }) {
  const ticketCode = `#TKT-${inquiry._id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-5 text-darkNavy dark:text-white">
        <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-bold border border-rose-200 dark:border-rose-800">
              🗑️
            </div>
            <div>
              <h3 className="font-poppins font-bold text-base text-darkNavy dark:text-white">
                Delete Inquiry Ticket?
              </h3>
              <p className="text-xs font-mono font-bold text-indigo-600 dark:text-sky-300">{ticketCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg p-1 cursor-pointer">✕</button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
            <p className="font-bold text-darkNavy dark:text-white">Patient: {inquiry.fullName}</p>
            <p className="text-slate-500 dark:text-slate-300 font-mono">Subject: {inquiry.subject || 'General Inquiry'}</p>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Are you sure you want to permanently delete this inquiry ticket? This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : '🗑️ Yes, Delete Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete All Inquiries Confirmation Modal
function ConfirmDeleteAllInquiriesModal({ totalCount, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-5 text-darkNavy dark:text-white">
        <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-bold border border-rose-200 dark:border-rose-800">
              ⚠️
            </div>
            <div>
              <h3 className="font-poppins font-bold text-base text-darkNavy dark:text-white">
                Delete All Patient Inquiries?
              </h3>
              <p className="text-xs text-rose-500 font-bold">Action Cannot Be Undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg p-1 cursor-pointer">✕</button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
            You are about to permanently delete <strong className="font-extrabold font-mono text-sm underline">{totalCount}</strong> patient inquiry tickets from the database.
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {deleting ? 'Clearing All...' : '🗑️ Yes, Delete All'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Granular Role-Based Access Control (RBAC) & Permission Management Modal
function StaffRbacModal({ staff, onClose, onUpdated }) {
  const DESIGNATION_OPTIONS = [
    { id: 'RECEPTIONIST', label: '📋 Receptionist', desc: 'General OPD Reception & Registration Desk' },
    { id: 'OPD_DESK', label: '🩺 OPD Desk', desc: 'OPD Token Counter & Patient Queue Manager' },
    { id: 'OPERATION_THEATER', label: '✂️ Operation Theater', desc: 'OT Surgery Scheduling & Surgical Desk' },
    { id: 'BILLING_DESK', label: '💳 Billing Desk', desc: 'Billing, Cashier & Tariff Management Desk' },
    { id: 'PHARMACY_DESK', label: '💊 Pharmacy Desk', desc: 'Pharmacy & Prescription Dispensing Desk' },
    { id: 'PATIENT_CARE', label: '💬 Patient Care', desc: 'Patient Support, Helpdesk & Inquiries' },
  ];

  const ALL_PERMISSIONS = [
    { id: 'manage_queue', label: '🎫 Manage OPD Tokens & Queue', desc: 'Issue tokens & update patient queue status' },
    { id: 'assign_doctor', label: '🩺 Assign Doctors to OPD Bookings', desc: 'Assign available doctors & OPD rooms' },
    { id: 'walkin_registration', label: '📝 Counter Walk-in Registration', desc: 'Register new walk-in patients at desk' },
    { id: 'manage_inquiries', label: '💬 Patient Support & Inquiries', desc: 'Respond to patient helpdesk support messages' },
    { id: 'view_medical_records', label: '📁 Access Patient Medical Records', desc: 'View past consultation history & reports' },
    { id: 'manage_ot_schedules', label: '✂️ Manage OT & Surgery Schedules', desc: 'Schedule & update Operation Theater slots' },
    { id: 'manage_billing', label: '💳 Process Bills & Issue Receipts', desc: 'Collect consultation fees & process receipts' },
  ];

  const DEFAULT_PERM_MAP = {
    RECEPTIONIST: ['manage_queue', 'assign_doctor', 'walkin_registration', 'manage_inquiries'],
    OPD_DESK: ['manage_queue', 'assign_doctor', 'walkin_registration'],
    OPERATION_THEATER: ['manage_ot_schedules', 'view_medical_records'],
    BILLING_DESK: ['manage_billing', 'view_medical_records'],
    PHARMACY_DESK: ['view_medical_records'],
    PATIENT_CARE: ['manage_inquiries', 'view_medical_records'],
  };

  const initialDesignation = ['RECEPTIONIST', 'OPD_DESK', 'OPERATION_THEATER', 'BILLING_DESK', 'PHARMACY_DESK', 'PATIENT_CARE'].includes(staff.designation)
    ? staff.designation
    : 'RECEPTIONIST';

  const [designation, setDesignation] = useState(initialDesignation);
  const [permissions, setPermissions] = useState(
    Array.isArray(staff.permissions) && staff.permissions.length > 0
      ? staff.permissions
      : DEFAULT_PERM_MAP[initialDesignation] || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleDesignationChange = (newDesig) => {
    setDesignation(newDesig);
    setPermissions(DEFAULT_PERM_MAP[newDesig] || []);
  };

  const togglePermission = (permId) => {
    if (permissions.includes(permId)) {
      setPermissions(permissions.filter((p) => p !== permId)); // Revoke permission
    } else {
      setPermissions([...permissions, permId]); // Grant permission
    }
  };

  const handleGrantAll = () => setPermissions(ALL_PERMISSIONS.map((p) => p.id));
  const handleRevokeAll = () => setPermissions([]);
  const handleResetDefaults = () => setPermissions(DEFAULT_PERM_MAP[designation] || []);

  const DEFAULT_DESK_MAP = {
    RECEPTIONIST: 'Desk 1 - Reception Main',
    OPD_DESK: 'Desk 2 - OPD Token Counter',
    OPERATION_THEATER: 'Desk 3 - Operation Theater Desk',
    BILLING_DESK: 'Desk 4 - Billing & Cashier Counter',
    PHARMACY_DESK: 'Desk 5 - Pharmacy Dispensing Counter',
    PATIENT_CARE: 'Desk 6 - Patient Care & Helpdesk',
  };

  async function handleSaveRBAC(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const targetDesk = DEFAULT_DESK_MAP[designation] || staff.deskNumber || 'Desk 1 - Reception Main';
      await axiosClient.put(`/admin/staff/${staff._id}`, {
        designation,
        permissions,
        deskNumber: targetDesk,
      });
      onUpdated(`RBAC designation & permissions updated for ${staff.user?.fullName || 'Staff Member'}!`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update RBAC permissions.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg flex items-center gap-2">
              <span>🛡️</span> RBAC Designation & Permission Matrix
            </h3>
            <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
              Staff Member: <strong className="text-darkNavy dark:text-white">{staff.user?.fullName}</strong> ({staff.user?.email})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-xl cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSaveRBAC} className="space-y-5">
          {/* Section 1: Staff Designation Role */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-darkNavy dark:text-white uppercase tracking-wider">
              1. Assign Operational Designation / Desk Role
            </label>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {DESIGNATION_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDesignationChange(d.id)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    designation === d.id
                      ? 'bg-primary/10 dark:bg-sky-950/60 border-primary text-primary dark:text-sky-300 shadow-2xs font-extrabold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-darkNavy dark:text-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{d.label}</span>
                    {designation === d.id && <span className="text-xs font-bold text-primary dark:text-sky-400">✓</span>}
                  </div>
                  <span className="text-[10px] text-slateText dark:text-slate-400 font-normal mt-1 leading-snug">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Granular Permissions List (Grant / Revoke) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-xs font-extrabold text-darkNavy dark:text-white uppercase tracking-wider">
                2. Granular Operation Permissions ({permissions.length}/{ALL_PERMISSIONS.length} Granted)
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                <button
                  type="button"
                  onClick={handleGrantAll}
                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  Grant All
                </button>
                <button
                  type="button"
                  onClick={handleRevokeAll}
                  className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 cursor-pointer"
                >
                  Revoke All
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {ALL_PERMISSIONS.map((perm) => {
                const isGranted = permissions.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-2xl border transition cursor-pointer ${
                      isGranted
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-darkNavy dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-75'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isGranted}
                      readOnly
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isGranted ? 'text-darkNavy dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {perm.label}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isGranted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                        }`}>
                          {isGranted ? '✓ GRANTED' : '🚫 REVOKED'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slateText dark:text-slate-400 mt-0.5 leading-snug">{perm.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          {/* Footer Controls */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {saving ? 'Saving RBAC...' : '✓ Save RBAC Permissions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminReviewBlogModal({ blog, onClose, onConfirm, onReject }) {
  const [category, setCategory] = useState(blog.category || 'General Health');
  const [role, setRole] = useState(blog.role || 'Clinical Specialist');
  const [author, setAuthor] = useState(blog.author || 'Doctor');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const categoryOptions = [
    'General Health',
    'Cardiology',
    'Heart Health',
    'Diabetes Awareness',
    'Child Care',
    'Orthopedics & Spine',
    'Emergency Care',
    'Nutrition & Diet',
    'Mental Health',
    'Women\'s Health',
    'Neurology',
    'Oncology',
    'Dental Care',
    'Dermatology',
    'Gastroenterology',
    'Pulmonology',
    'Nephrology',
  ];

  return (
    <div className="fixed inset-0 bg-darkNavy/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-poppins font-black text-darkNavy dark:text-white text-lg flex items-center gap-2">
              <span>🔍 Review & Publish Doctor Blog</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verify author information, select blog category, and set author clinical role.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-darkNavy dark:hover:text-white flex items-center justify-center font-bold text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Article Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase font-mono">
            ⏳ Doctor Submission
          </span>
          <h4 className="font-bold text-darkNavy dark:text-white text-sm">
            {blog.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            {blog.desc}
          </p>
        </div>

        {/* Category & Role Assignment Form */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-extrabold text-darkNavy dark:text-slate-200 mb-1">
              ✍️ Author Doctor Name (Submitted By)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full font-bold border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-darkNavy dark:text-slate-200 mb-1">
                🏷️ Select Blog Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full font-bold border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {!categoryOptions.includes(category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-darkNavy dark:text-slate-200 mb-1">
                🏅 Assign Author Role *
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Consultant Cardiologist"
                className="w-full font-bold border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {isRejecting && (
            <div className="pt-2">
              <label className="block font-extrabold text-rose-600 dark:text-rose-400 mb-1">
                ⚠️ Rejection Reason for Doctor *
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify clinical or editorial guidelines reason for rejecting..."
                className="w-full border border-rose-300 dark:border-rose-800 rounded-xl p-2.5 bg-rose-50/50 dark:bg-rose-950/40 text-darkNavy dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          {!isRejecting ? (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                ❌ Reject with Reason
              </button>
              <button
                type="button"
                onClick={() => onConfirm({ category, role, author })}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                ✅ Confirm & Publish Blog
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onReject({ rejectionReason, category, role, author })}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              Submit Rejection Notice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovalConfirmModal({ itemObj, type, onClose, onConfirm }) {
  const [approving, setApproving] = useState(false);

  const rawName = itemObj?.user?.fullName || itemObj?.fullName || 'Applicant';
  const displayName = type === 'doctor' ? (/^dr\.?/i.test(rawName) ? rawName : `Dr. ${rawName}`) : rawName;
  const email = itemObj?.user?.email || itemObj?.email || 'N/A';
  const phone = itemObj?.user?.phone || itemObj?.phone || 'N/A';
  const dept = itemObj?.specialization || itemObj?.department?.name || (type === 'doctor' ? 'General Medicine' : 'Reception Desk');

  async function handleConfirm() {
    setApproving(true);
    await onConfirm();
    setApproving(false);
  }

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              ✅ Application Verification
            </span>
            <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg mt-2">
              Confirm Account Approval
            </h3>
            <p className="text-xs text-slateText dark:text-slate-400 mt-1">
              Verify credentials and approve login access for <strong className="text-darkNavy dark:text-white">{displayName}</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Applicant Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-[10px]">Applicant Name</span> <span className="font-extrabold text-darkNavy dark:text-white">{displayName}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-[10px]">Email Address</span> <span className="font-mono font-bold text-darkNavy dark:text-slate-200">{email}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-[10px]">Contact Phone</span> <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{phone}</span></div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60"><span className="text-slate-400 font-bold uppercase text-[10px]">Specialization / Dept</span> <span className="font-extrabold text-primary dark:text-sky-300">{dept}</span></div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Approving will grant <strong>{displayName}</strong> active status, enabling instant login to their portal dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={approving}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={approving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {approving ? 'Activating...' : '✅ Confirm & Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectionReasonModal({ itemObj, type, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const PRESETS = [
    'Incomplete medical license verification documents',
    'Invalid or unreachable contact phone number',
    'Qualification credentials require further hospital verification',
    'Duplicate account registration request',
    'Inaccurate registration details provided'
  ];

  function handleSelectPreset(preset) {
    setSelectedPreset(preset);
    setReason(preset);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  }

  const name = itemObj?.user?.fullName || itemObj?.fullName || 'Applicant';
  const email = itemObj?.user?.email || itemObj?.email || '';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full">
              ⚠️ Application Rejection
            </span>
            <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg mt-2">
              Reason of Rejection
            </h3>
            <p className="text-xs text-slateText dark:text-slate-400 mt-1">
              Specify official rejection reason for <strong className="text-darkNavy dark:text-white">{type === 'doctor' ? 'Dr. ' + name : name}</strong> ({email}).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Select Presets */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
            ⚡ Select Reason Preset:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-xl border transition cursor-pointer font-medium text-left ${
                  selectedPreset === preset
                    ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Reason Textarea */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-darkNavy dark:text-slate-200 mb-1.5">
              ✍️ Reason for Rejection *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => { setReason(e.target.value); setSelectedPreset(''); }}
              placeholder="Enter official reason for rejecting this application..."
              className="w-full border border-slate-300 dark:border-slate-700 rounded-2xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>✕</span> Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

