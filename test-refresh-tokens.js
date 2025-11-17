// Test script to verify refresh token functionality
const baseURL = 'http://localhost:3000';

async function testRefreshTokens() {
  console.log('🧪 Testing Refresh Token Functionality\n');

  try {
    // 1. Register a new user
    console.log('1️⃣ Registering a new user...');
    const registerResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const registerData = await registerResponse.json();
    console.log('✅ Register response:', {
      success: registerData.success,
      message: registerData.message,
      hasAccessToken: !!registerData.data?.accessToken,
      hasRefreshToken: !!registerData.data?.refreshToken
    });

    if (!registerData.success) {
      console.log('❌ Registration failed, trying login...\n');

      // Try login instead
      console.log('2️⃣ Trying to login...');
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const loginData = await loginResponse.json();
      console.log('✅ Login response:', {
        success: loginData.success,
        message: loginData.message,
        hasAccessToken: !!loginData.data?.accessToken,
        hasRefreshToken: !!loginData.data?.refreshToken
      });

      if (!loginData.success) {
        console.log('❌ Both register and login failed');
        return;
      }

      // Use login tokens
      var { accessToken, refreshToken } = loginData.data;
    } else {
      // Use register tokens
      var { accessToken, refreshToken } = registerData.data;
    }

    console.log('\n3️⃣ Testing refresh token endpoint...');
    const refreshResponse = await fetch(`${baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });

    const refreshData = await refreshResponse.json();
    console.log('✅ Refresh response:', {
      success: refreshData.success,
      message: refreshData.message,
      hasNewAccessToken: !!refreshData.data?.accessToken,
      hasNewRefreshToken: !!refreshData.data?.refreshToken
    });

    if (refreshData.success) {
      console.log('\n🎉 Refresh token functionality working correctly!');
    } else {
      console.log('\n❌ Refresh token test failed:', refreshData.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testRefreshTokens();