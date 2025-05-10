import FriendRequest from "../models/friend-request.js";
import User from "../models/User.js";

export async function recommendedUsers(req, res) {
  try {
    const currentUser = req.user;
    const userId = currentUser._id;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: userId } }, //exclude current user
        {
          $id: { $nin: currentUser.friends }, //exclude friends
        },
        {
          isOnboarder: true, //only show onboarders
        },
      ],
    });

    return res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in recommendedUsers controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function friends(req, res) {
  try {
    const currentUser = req.user; // Assuming `req.user` contains the authenticated user data
    const userId = currentUser._id; // Get the user's ID

    // Find the current user and populate the friends list
    const user = await User.findById(userId)
      .select("friends") // Only select the `friends` field
      .populate("friends", "fullName profilePicture username"); // Populate the `friends` field with fullName, profilePicture, and username

    return res.status(200).json(user.friends); // Return the populated friends
  } catch (error) {
    console.error("Error in friends controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function friendRequest(req, res) {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    //prevent sending friend request to self
    if (currentUser._id.toString() === id) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if the recipient exists
    const recipient = await User.findById(id);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    // Check if user is already a friend
    if (recipient.friends.includes(currentUser._id)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    //ceck if a friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUser._id, recipient: id },
        { sender: id, recipient: currentUser._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Create a new friend request
    const newFriendRequest = new FriendRequest({
      sender: currentUser._id,
      recipient: id,
    });

    return res.status(201).json(newFriendRequest);
  } catch (error) {
    console.error("Error in friendRequest controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function acceptRequest(req, res) {
  try {
    const { id } = req.params;
    const friendRequest = await FriendRequest.findById(id);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    //verify that the current user is the recipient of the request
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted"; // Update the status of the friend request
    await friendRequest.save();

    // Add each user to the other's friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({
      message: "Friend request accepted",
      friendRequest,
    });
  } catch (error) {
    console.error("Error in acceptRequest controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePicture username");

    const acceptedRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePicture username");

    return res.status(200).json({ incomingRequests, outgoingRequests });
  } catch (error) {
    console.error("Error in getFriendRequests controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getOutgoingRequests(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePicture username");

    return res.status(200).json({ outgoingRequests });
  } catch (error) {
    console.error("Error in getOutgoingRequests controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
