import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';
import { userRepository } from '../repositories/userRepository';
import { communityRepository } from '../repositories/communityRepository';
import { auditService } from './auditService';
import { ROLES, USER_STATUS } from '../utils/constants';
import { validateUsername, validateEmail, validatePassword, validateCommunityCode } from '../utils/validators';
import { generateId } from '../utils/helpers';

export const authService = {
  async register({ fullName, username, email, password, mobileNumber, communityCode }) {
    const usernameErr = validateUsername(username);
    if (usernameErr) throw new Error(usernameErr);
    const emailErr = validateEmail(email);
    if (emailErr) throw new Error(emailErr);
    const passwordErr = validatePassword(password);
    if (passwordErr) throw new Error(passwordErr);
    const codeErr = validateCommunityCode(communityCode);
    if (codeErr) throw new Error(codeErr);

    const community = await communityRepository.getByCode(communityCode);
    if (!community) throw new Error('Invalid community code');
    if (community.status !== 'active') throw new Error('Community is not accepting registrations');

    const existing = await userRepository.getByEmail(email.toLowerCase());
    if (existing) throw new Error('Email already registered');

    const existingUsername = await userRepository.getByUsername(username.toLowerCase());
    if (existingUsername) throw new Error('Username already taken');

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userId = cred.user.uid;

    const userData = {
      userId,
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      mobileNumber,
      communityId: community.id,
      role: ROLES.PARTICIPANT,
      status: USER_STATUS.PENDING,
      registrationDate: new Date(),
      lastLogin: null,
      loginToken: null,
      loginTokenExpiry: null,
      profilePhotoUrl: null,
    };

    await userRepository.create(userId, userData);
    await communityRepository.incrementMemberCount(community.id, 1);

    return { user: userData, community };
  },

  async login(email, password, communityCode) {
    const community = await communityRepository.getByCode(communityCode);
    if (!community) throw new Error('Invalid community code');

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userId = cred.user.uid;
    const userProfile = await userRepository.getById(userId);

    if (!userProfile) throw new Error('User profile not found');
    if (userProfile.communityId !== community.id) {
      await signOut(auth);
      throw new Error('You are not a member of this community');
    }

    if (userProfile.status === USER_STATUS.PENDING) {
      await signOut(auth);
      throw new Error('Your account is pending admin approval');
    }
    if (userProfile.status === USER_STATUS.REJECTED) {
      await signOut(auth);
      throw new Error('Your registration has been rejected. Contact your community admin.');
    }
    if (userProfile.status === USER_STATUS.SUSPENDED) {
      await signOut(auth);
      throw new Error('Your account has been suspended. Contact your community admin.');
    }

    await userRepository.update(userId, { lastLogin: new Date() });

    await auditService.log({
      userId, username: userProfile.username, communityId: community.id,
      action: 'LOGIN', resource: 'users', resourceId: userId, details: { email },
    });

    sessionStorage.setItem('sessionId', generateId('sess_'));

    return { user: { ...userProfile, lastLogin: new Date() }, community };
  },

  async logout(userId, username, communityId) {
    if (userId && username && communityId) {
      await auditService.log({
        userId, username, communityId,
        action: 'LOGOUT', resource: 'users', resourceId: userId,
      });
    }
    await signOut(auth);
  },

  async changePassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
  },

  async sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email);
  },

  async resetWithToken(communityCode, loginToken, newPassword) {
    // Community admin generates a login token; user resets password here
    const community = await communityRepository.getByCode(communityCode);
    if (!community) throw new Error('Invalid community code');

    const passwordErr = validatePassword(newPassword);
    if (passwordErr) throw new Error(passwordErr);

    const { getDocs, query, where, collection, db } = await Promise.all(
      ['firebase/firestore'].map((m) => import(m))
    ).then(([fs]) => [fs.getDocs, fs.query, fs.where, fs.collection, fs.db]);

    const q = query(collection(db, 'users'), where('loginToken', '==', loginToken));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Invalid login token');
    const userDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
    if (userDoc.communityId !== community.id) throw new Error('Token does not match community');
    if (userDoc.loginTokenExpiry?.toDate?.() < new Date()) throw new Error('Token has expired');

    // User must reset password via Firebase (would normally trigger email; here we send a reset email)
    await sendPasswordResetEmail(auth, userDoc.email);
    await userRepository.update(userDoc.id, { loginToken: null, loginTokenExpiry: null });
  },

  async generateLoginToken(userId, adminId, adminUsername, communityId) {
    const token = generateId('tok_');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await userRepository.update(userId, { loginToken: token, loginTokenExpiry: expiry });
    await auditService.log({
      userId: adminId, username: adminUsername, communityId,
      action: 'PASSWORD_CHANGE', resource: 'users', resourceId: userId,
      details: { generatedToken: true },
    });
    return { token, expiry };
  },
};
