import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from "react-native-appwrite";

// Init your React Native SDK
export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "net.abdaziz.aora",
  projectId: "673c2ae0001e967c08f0",
  databaseId: "673c2c7d003aa47bb8ea",
  userCollectionId: "673c2cb8002b273949b5",
  videoCollectionId: "673c2cf8001786a9924d",
  storageId: "673c2fe4000bbfc02890",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = config;

// Init the Appwrite SDK
const client = new Client();

// Set the SDK endpoint
client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform); // Your application ID or bundle ID.

// Create instances of the services
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// create user account and sign in function
export const createUser = async (email, password, username) => {
  try {
    //create account
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw new Error("Account creation failed");
    console.log(newAccount);
    const avatarUrl = avatars.getInitials(username);

    //sign in
    await signIn(email, password);

    //create user on databases
    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    //return the new user
    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    //session sign in
    const session = await account.createEmailPasswordSession(email, password);
    if (!session) throw new Error("Sign in failed");
    return session;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw new Error("User account not found");

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw new Error("User not found on databases");

    return currentUser.documents[0];
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};