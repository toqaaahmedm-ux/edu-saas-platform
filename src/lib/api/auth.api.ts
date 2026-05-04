import { USERS_DATA } from '@/data/users.data';
import { LoginInput } from '@/lib/validators/auth.schema';

export const authApi = {
  // محاكاة عملية تسجيل الدخول
  login: async (data: LoginInput) => {
    // هنا بنعمل محاكاة للـ POST Request
    const user = USERS_DATA.find(
      (u) => u.email === data.email && u.password === data.password
    );
    
    if (!user) {
      throw new Error("Invalid email or password");
    }
    
    return { data: user };
  },
  
  logout: async () => {
    // محاكاة الـ Logout
    return { success: true };
  }
};
