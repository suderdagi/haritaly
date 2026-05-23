import { prisma } from './db';
import { FriendshipStatus } from '@prisma/client';

export const friendsLib = {
  // Send a friend request
  async sendFriendRequest(senderId: number, receiverId: number) {
    // Check if users are the same
    if (senderId === receiverId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new Error('User not found');
    }

    // Check if request already exists
    const existing = await prisma.friendship.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (existing) {
      if (existing.status === FriendshipStatus.PENDING) {
        throw new Error('Friend request already sent');
      }
      if (existing.status === FriendshipStatus.ACCEPTED) {
        throw new Error('Already friends');
      }
      // If rejected, allow resending
      if (existing.status === FriendshipStatus.REJECTED) {
        return await prisma.friendship.update({
          where: { id: existing.id },
          data: {
            status: FriendshipStatus.PENDING,
            updatedAt: new Date(),
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            receiver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
        });
      }
    }

    // Create new friendship request
    return await prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });
  },

  // Accept a friend request
  async acceptFriendRequest(userId: number, friendshipId: number) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    // Check if user is the receiver
    if (friendship.receiverId !== userId) {
      throw new Error('Unauthorized: You are not the receiver of this request');
    }

    // Check if request is pending
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new Error(`Cannot accept request with status: ${friendship.status}`);
    }

    return await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: FriendshipStatus.ACCEPTED,
        updatedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });
  },

  // Reject a friend request
  async rejectFriendRequest(userId: number, friendshipId: number) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    // Check if user is the receiver
    if (friendship.receiverId !== userId) {
      throw new Error('Unauthorized: You are not the receiver of this request');
    }

    // Check if request is pending
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new Error(`Cannot reject request with status: ${friendship.status}`);
    }

    return await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: FriendshipStatus.REJECTED,
        updatedAt: new Date(),
      },
    });
  },

  // Get list of friends
  async getFriends(userId: number) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            status: FriendshipStatus.ACCEPTED,
          },
          {
            receiverId: userId,
            status: FriendshipStatus.ACCEPTED,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            bio: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            bio: true,
          },
        },
      },
    });

    // Map to get friend (not self)
    return friendships.map((friendship) => {
      const friend =
        friendship.senderId === userId ? friendship.receiver : friendship.sender;
      return {
        ...friend,
        status: friendship.status,
      };
    });
  },

  // Get pending friend requests (received)
  async getPendingRequests(userId: number) {
    return await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Get pending sent requests
  async getSentRequests(userId: number) {
    return await prisma.friendship.findMany({
      where: {
        senderId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Remove a friend
  async removeFriend(userId: number, friendId: number) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          {
            senderId: userId,
            receiverId: friendId,
          },
          {
            senderId: friendId,
            receiverId: userId,
          },
        ],
      },
    });

    if (!friendship) {
      throw new Error('Friendship not found');
    }

    return await prisma.friendship.delete({
      where: { id: friendship.id },
    });
  },

  // Check if two users are friends
  async areFriends(userId1: number, userId2: number) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          {
            senderId: userId1,
            receiverId: userId2,
          },
          {
            senderId: userId2,
            receiverId: userId1,
          },
        ],
      },
    });

    return !!friendship;
  },
};
