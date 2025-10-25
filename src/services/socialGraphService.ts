import { supabase } from '../lib/supabase';
import { getUserFriends } from './friendshipService';
import type { GraphNode, GraphEdge, SocialGraphData, UserData } from '../lib/supabase';

/**
 * Get social graph data for a user including friends and friends-of-friends
 * @param userId - The current user's ID
 * @returns Structured graph data with nodes and edges
 */
export async function getSocialGraphData(userId: string): Promise<SocialGraphData> {
  console.log('📊 Fetching social graph data for user:', userId);

  try {
    // Step 1: Get current user's data
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) {
      console.error('Error fetching current user:', userError);
      return { nodes: [], edges: [] };
    }

    // Step 2: Get 1st degree friends
    const firstDegreeFriendships = await getUserFriends(userId);
    console.log(`Found ${firstDegreeFriendships.length} 1st degree friends`);

    if (firstDegreeFriendships.length === 0) {
      // No friends, return only self node
      return {
        nodes: [{
          id: userId,
          type: 'self',
          userData: currentUser,
          degree: 0,
        }],
        edges: [],
      };
    }

    // Build nodes map to track all unique users
    const nodesMap = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    // Add self node
    nodesMap.set(userId, {
      id: userId,
      type: 'self',
      userData: currentUser,
      degree: 0,
    });

    // Add 1st degree friends
    const firstDegreeFriendIds: string[] = [];
    for (const friendship of firstDegreeFriendships) {
      const friendId = friendship.user.id;
      firstDegreeFriendIds.push(friendId);

      nodesMap.set(friendId, {
        id: friendId,
        type: 'friend',
        userData: friendship.user,
        degree: 1,
      });

      // Add direct edge from user to friend
      edges.push({
        id: `${userId}-${friendId}`,
        source: userId,
        target: friendId,
        type: 'direct',
      });
    }

    // Step 3: Get 2nd degree friends (friends-of-friends)
    const secondDegreeMap = new Map<string, UserData>();

    for (const friendId of firstDegreeFriendIds) {
      try {
        const friendsOfFriend = await getUserFriends(friendId);
        console.log(`Friend ${friendId} has ${friendsOfFriend.length} friends`);

        for (const fofFriendship of friendsOfFriend) {
          const fofId = fofFriendship.user.id;

          // Skip if it's the current user or already a 1st degree friend
          if (fofId === userId || firstDegreeFriendIds.includes(fofId)) {
            // If both are user's friends, add a direct edge between them
            if (firstDegreeFriendIds.includes(fofId) && friendId < fofId) {
              // Use < to avoid duplicate edges
              edges.push({
                id: `${friendId}-${fofId}`,
                source: friendId,
                target: fofId,
                type: 'direct',
              });
            }
            continue;
          }

          // Add as 2nd degree friend if not already added
          if (!secondDegreeMap.has(fofId)) {
            secondDegreeMap.set(fofId, fofFriendship.user);
          }

          // Add indirect edge from user to friend-of-friend (via friend)
          const edgeId = `${userId}-${fofId}-via-${friendId}`;
          if (!edges.find(e => e.id === edgeId)) {
            edges.push({
              id: edgeId,
              source: userId,
              target: fofId,
              type: 'indirect',
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching friends of friend ${friendId}:`, error);
      }
    }

    // Add 2nd degree nodes
    for (const [fofId, fofData] of secondDegreeMap) {
      nodesMap.set(fofId, {
        id: fofId,
        type: 'friend-of-friend',
        userData: fofData,
        degree: 2,
      });
    }

    const nodes = Array.from(nodesMap.values());

    console.log(`✅ Social graph built: ${nodes.length} nodes, ${edges.length} edges`);
    console.log(`  - Self: 1`);
    console.log(`  - 1st degree friends: ${firstDegreeFriendIds.length}`);
    console.log(`  - 2nd degree friends: ${secondDegreeMap.size}`);

    return { nodes, edges };
  } catch (error) {
    console.error('Error building social graph:', error);
    return { nodes: [], edges: [] };
  }
}

