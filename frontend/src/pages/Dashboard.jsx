import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Bed, Home, CreditCard, CheckCircle, XCircle, Users, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

const AnimatedCounter = ({ from, to, duration = 2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * (to - from) + from));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [from, to, duration]);

  return <span>{count}</span>;
}

const DashboardRowItem = ({ title, value, icon, prefix = '', onClick, color = 'var(--color-accent)', bgColor = 'var(--color-accent-light)' }) => {
  return (
    <div 
      onClick={onClick}
      className="minimal-card" 
      style={{ 
        padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{title}</h3>
        <div style={{ padding: '10px', borderRadius: '8px', background: bgColor, color: color }}>
           {icon}
        </div>
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: color }}>
        {prefix}<AnimatedCounter from={0} to={value} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/stats');
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ marginLeft: '300px', padding: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {loading ? 'Loading Dashboard...' : 'Error loading dashboard data. Please try again.'}
          </p>
        </main>
      </div>
    );
  }

  const isAdmin = stats?.role === 'Admin';

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1 }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>
              {isAdmin ? 'Admin Dashboard' : `Welcome, ${stats.user?.name?.split(' ')[0] || 'Student'}!`}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>
              {isAdmin ? 'Hostel overview and statistics' : 'Your hostel stay details and status'}
            </p>
          </div>
          {!isAdmin && stats.user.room && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', 
              background: 'var(--color-accent-light)', padding: '10px 20px', 
              borderRadius: '12px', border: '1px solid var(--color-border)' 
            }}>
              <Bed size={20} color="var(--color-accent)" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Allocated Room</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>Room {stats.user.room.room_number}</p>
              </div>
            </div>
          )}
        </header>

        {isAdmin ? (
          <>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
              <DashboardRowItem 
                title="Total Students" 
                value={stats.totalStudents} 
                icon={<Users size={20} />} 
                onClick={() => navigate('/students')} 
                color="#2563EB"
                bgColor="#DBEAFE"
              />
              <DashboardRowItem 
                title="Room Availability" 
                value={stats.availableRooms} 
                icon={<Home size={20} />} 
                onClick={() => navigate('/rooms')} 
                color="#059669"
                bgColor="#D1FAE5"
              />
              <DashboardRowItem 
                title="Pending Gate Pass" 
                value={stats.pendingGatePasses} 
                icon={<FileText size={20} />} 
                onClick={() => navigate('/gatepass')} 
                color="#7C3AED"
                bgColor="#F3E8FF"
              />
              <DashboardRowItem 
                title="Pending Fines" 
                value={stats.pendingFines} 
                prefix="₹" 
                icon={<AlertTriangle size={20} />} 
                onClick={() => navigate('/fines')} 
                color="#DC2626"
                bgColor="#FEE2E2"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
               <div className="minimal-card" style={{ flex: 2, padding: '30px', height: '400px', display: 'flex', flexDirection: 'column' }}>
                 <h3 style={{ color: 'var(--color-accent)', marginBottom: '20px', fontWeight: 600 }}>Occupancy Rate</h3>
                 <div style={{ width: '100%', flex: 1, background: 'var(--color-accent-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '3rem', fontWeight: 700 }}>{stats.occupancyRate}%</p>
                 </div>
               </div>
               
               <div className="minimal-card" style={{ flex: 1, padding: '30px', height: '400px', display: 'flex', flexDirection: 'column' }}>
                 <h3 style={{ color: 'var(--color-accent)', marginBottom: '20px', fontWeight: 600 }}>Recent Activity</h3>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                         <div style={{ flex: 1 }}>
                            <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 500 }}>System online</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>All services running</p>
                         </div>
                    </div>
                 </div>
               </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div className="minimal-card" style={{ flex: 1, padding: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: '#F3E8FF', color: '#7C3AED' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 600 }}>Security</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Account protection</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>
                    Keep your account secure by updating your password regularly.
                  </p>
                  <button 
                    onClick={() => navigate('/change-password')}
                    style={{ 
                      background: '#F3E8FF', 
                      border: 'none', 
                      color: '#7C3AED', 
                      fontWeight: 700, 
                      cursor: 'pointer', 
                      fontSize: '0.85rem',
                      padding: '8px 20px',
                      borderRadius: '20px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="minimal-card" style={{ flex: 1, padding: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: stats.pendingFinesAmount > 0 ? '#FEE2E2' : '#D1FAE5', color: stats.pendingFinesAmount > 0 ? '#DC2626' : '#059669' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>My Fines</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Pending dues</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: stats.pendingFinesAmount > 0 ? '#DC2626' : '#059669', marginBottom: '10px' }}>
                    ₹{stats.pendingFinesAmount || 0}
                  </div>
                  <button 
                    onClick={() => navigate('/fines')}
                    style={{ 
                      background: stats.pendingFinesAmount > 0 ? '#FEE2E2' : '#D1FAE5', 
                      border: 'none', 
                      color: stats.pendingFinesAmount > 0 ? '#DC2626' : '#059669', 
                      fontWeight: 700, 
                      cursor: 'pointer', 
                      fontSize: '0.85rem',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      transition: 'all 0.2s'
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="minimal-card" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CreditCard size={20} /> My Bookings & Fees
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Room</th>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Start Date</th>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Duration</th>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.bookings?.length > 0 ? stats.bookings.map((booking) => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '12px 15px', fontWeight: 500 }}>
                          {booking.room_number || (stats.user.room ? `Room ${stats.user.room.room_number}` : 'N/A')}
                        </td>
                        <td style={{ padding: '12px 15px' }}>{new Date(booking.start_date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 15px' }}>{booking.duration} Months</td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                            background: booking.status === 'Approved' ? '#D1FAE5' : (booking.status === 'Pending' ? '#FEF3C7' : '#FEE2E2'),
                            color: booking.status === 'Approved' ? '#059669' : (booking.status === 'Pending' ? '#D97706' : '#DC2626')
                          }}>
                            {booking.status || 'Approved'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                            background: booking.payment_status === 'Paid' ? '#D1FAE5' : '#FEF3C7',
                            color: booking.payment_status === 'Paid' ? '#059669' : '#D97706'
                          }}>
                            {booking.payment_status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="minimal-card" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} /> Recent Gate Passes
                </h3>
                <button 
                  onClick={() => navigate('/gatepass')}
                  style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                >
                  View All
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Reason</th>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Departure</th>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Return</th>
                      <th style={{ padding: '12px 15px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.gatePasses?.length > 0 ? stats.gatePasses.map((gp) => (
                      <tr key={gp._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '12px 15px', fontWeight: 500 }}>{gp.reason}</td>
                        <td style={{ padding: '12px 15px' }}>{new Date(gp.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td style={{ padding: '12px 15px' }}>{new Date(gp.return_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                            background: gp.status === 'Approved' ? '#D1FAE5' : (gp.status === 'Pending' ? '#FEF3C7' : '#FEE2E2'),
                            color: gp.status === 'Approved' ? '#059669' : (gp.status === 'Pending' ? '#D97706' : '#DC2626')
                          }}>
                            {gp.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No gate passes found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
