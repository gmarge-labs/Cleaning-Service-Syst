import { Request, Response } from 'express';
import { PrismaClient, Role, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // Get total revenue
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.COMPLETED, BookingStatus.CONFIRMED, BookingStatus.BOOKED]
        }
      },
      select: {
        totalAmount: true,
        createdAt: true,
        serviceType: true,
        status: true
      }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalBookings = bookings.length;

    // Get active cleaners
    const activeCleaners = await prisma.user.count({
      where: { role: Role.CLEANER }
    });

    // Service type distribution
    const serviceTypeCounts: Record<string, number> = {};
    bookings.forEach(b => {
      serviceTypeCounts[b.serviceType] = (serviceTypeCounts[b.serviceType] || 0) + 1;
    });

    const serviceTypeData = Object.entries(serviceTypeCounts).map(([name, value]) => ({
      name,
      value,
      color: name === 'Standard Cleaning' ? '#FF1493' : 
             name === 'Deep Cleaning' ? '#8b5cf6' : 
             name === 'Move In/Out' ? '#FF69B4' : '#f59e0b'
    }));

    // Revenue data for chart (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const revenueData = last7Days.map(date => {
      const dayBookings = bookings.filter(b => b.createdAt.toISOString().split('T')[0] === date);
      return {
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0),
        bookings: dayBookings.length
      };
    });

    // Recent activity from notifications
    const notifications = await prisma.notification.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const recentActivity = notifications.map(n => ({
      id: n.id,
      type: n.type,
      message: n.message,
      time: formatTimeAgo(n.createdAt),
      title: n.title
    }));

    // Get top performers (cleaners)
    const cleaners = await prisma.user.findMany({
      where: { role: Role.CLEANER },
      take: 5
    });

    const cleanerPerformance = cleaners.map(c => ({
      name: c.name,
      jobs: Math.floor(Math.random() * 20) + 5, // Placeholder until assignments are in schema
      rating: 4.5 + Math.random() * 0.5
    })).sort((a, b) => b.jobs - a.jobs);

    res.json({
      stats: {
        totalRevenue,
        totalBookings,
        activeCleaners,
        avgRating: 4.8 // Placeholder as Review model is missing
      },
      revenueData,
      serviceTypeData,
      recentActivity,
      cleanerPerformance
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getActiveJob = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the most recent active booking for this user
    // Active means PENDING, CONFIRMED, or COMPLETED (if not yet reviewed)
    const activeJob = await prisma.booking.findFirst({
      where: {
        userId: userId as string,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
        },
        reviews: {
          none: {}
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        reviews: true
      }
    });

    if (!activeJob) {
      return res.status(404).json({ message: 'No active job found' });
    }

    res.json(activeJob);
  } catch (error) {
    console.error('Get active job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getSupervisorStats = async (req: Request, res: Response) => {
  try {
    const activeJobs = await prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.RESCHEDULED]
        }
      },
      orderBy: { date: 'asc' }
    });

    const unassignedJobs = await prisma.booking.findMany({
      where: {
        status: BookingStatus.BOOKED
      },
      orderBy: { date: 'asc' }
    });

    const availableCleaners = await prisma.user.findMany({
      where: { role: Role.CLEANER },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true
      }
    });

    res.json({
      activeJobs,
      unassignedJobs,
      availableCleaners: availableCleaners.map(c => ({
        ...c,
        rating: 4.9, // Placeholder
        jobsToday: 0 // Placeholder
      })),
      pendingInspections: [] // Placeholder
    });
  } catch (error) {
    console.error('Get supervisor stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSupportStats = async (req: Request, res: Response) => {
  try {
    // Using notifications as a proxy for tickets for now
    const notifications = await prisma.notification.findMany({
      where: {
        type: {
          in: ['booking_created', 'booking_cancelled', 'cleaner_application']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const tickets = notifications.map(n => ({
      id: n.id,
      customer: n.title,
      subject: n.message,
      status: n.isRead ? 'Resolved' : 'New',
      priority: 'Medium',
      time: formatTimeAgo(n.createdAt)
    }));

    res.json({
      tickets,
      stats: {
        openTickets: tickets.filter(t => t.status === 'New').length,
        pendingFollowUps: 3, // Placeholder
        resolvedToday: tickets.filter(t => t.status === 'Resolved').length,
        avgResponseTime: 4.8 // Placeholder
      },
      upcomingFollowUps: [] // Placeholder
    });
  } catch (error) {
    console.error('Get support stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
