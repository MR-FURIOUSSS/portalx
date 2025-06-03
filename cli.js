#!/usr/bin/env node

import readline from 'readline';
import chalk from 'chalk';
import figlet from 'figlet';
import { verifyUser, verifyPassword } from './fetch/login.js';
import { withCaptcha } from './fetch/withcaptcha.js';
import { getCaptcha } from './utils/getCaptcha.js';
import { fetchUserInfo } from './fetch/user.js';
import { parseUserInfo } from './parser/user.js';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

// Helper function to ask for password (hidden input)
const askPassword = (question) => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
    let password = '';
    process.stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
};

// Display banner
const displayBanner = () => {
  console.clear();
  console.log(chalk.cyan(figlet.textSync('SRM Portal', { font: 'Small' })));
  console.log(chalk.yellow('🎓 SRM Academia Interactive Login\n'));
};

// Display loading animation
const showLoading = (message) => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  return setInterval(() => {
    process.stdout.write(`\r${chalk.blue(frames[i % frames.length])} ${message}`);
    i++;
  }, 100);
};

// Format user info beautifully
const displayUserInfo = (userInfo) => {
  console.log('\n' + chalk.green('✅ Login Successful!'));
  console.log(chalk.cyan('━'.repeat(50)));
  console.log(chalk.bold.yellow('🎓 STUDENT INFORMATION'));
  console.log(chalk.cyan('━'.repeat(50)));
  
  const info = [
    ['👤 Name', userInfo.name],
    ['🆔 Registration Number', userInfo.regNumber],
    ['📱 Mobile', userInfo.mobile],
    ['🏫 Department', userInfo.department],
    ['📚 Program', userInfo.program],
    ['📝 Section', userInfo.section],
    ['📅 Semester', userInfo.semester],
    ['👥 Batch', userInfo.batch]
  ];
  
  info.forEach(([label, value]) => {
    if (value) {
      console.log(`${chalk.blue(label.padEnd(25))}: ${chalk.white(value)}`);
    }
  });
  
  console.log(chalk.cyan('━'.repeat(50)));
  console.log(chalk.green('🚀 You can now use the API with your session token!'));
};

// Main authentication flow
const authenticate = async () => {
  try {
    displayBanner();
    
    // Step 1: Get username
    let username = await askQuestion(chalk.blue('📧 Enter your username/email: '));
    
    // Auto-append domain if needed
    if (!username.includes('@srmist.edu.in')) {
      username = username + '@srmist.edu.in';
    }
    
    // Step 2: Verify user
    console.log('');
    const loadingVerify = showLoading('Verifying user...');
    
    const userVerification = await verifyUser(username);
    clearInterval(loadingVerify);
    process.stdout.write('\r' + ' '.repeat(30) + '\r');
    
    if (userVerification.error) {
      console.log(chalk.red('❌ Error: ' + userVerification.error));
      rl.close();
      return;
    }
    
    console.log(chalk.green('✅ User verified successfully!'));
    
    // Step 3: Get password
    const password = await askPassword(chalk.blue('🔐 Enter your password: '));
    
    // Step 4: Authenticate with password
    console.log('');
    const loadingAuth = showLoading('Authenticating...');
    
    const authResult = await verifyPassword(
      userVerification.digest,
      userVerification.identity,
      password
    );
    
    clearInterval(loadingAuth);
    process.stdout.write('\r' + ' '.repeat(30) + '\r');
    
    if (authResult.error) {
      console.log(chalk.red('❌ Error: ' + authResult.error));
      rl.close();
      return;
    }
    
    let sessionToken = null;
    
    // Step 5: Handle CAPTCHA if required
    if (!authResult.isAuthenticated && authResult.captcha?.required) {
      console.log(chalk.yellow('🤖 CAPTCHA required for authentication'));
      
      // Get CAPTCHA image
      const loadingCaptcha = showLoading('Loading CAPTCHA...');
      const captchaData = await getCaptcha(authResult.captcha.digest);
      clearInterval(loadingCaptcha);
      process.stdout.write('\r' + ' '.repeat(30) + '\r');
      
      if (captchaData.error) {
        console.log(chalk.red('❌ Error loading CAPTCHA: ' + captchaData.error));
        rl.close();
        return;
      }
      
      console.log(chalk.blue('📷 CAPTCHA Image (base64): ') + captchaData.image_bytes.substring(0, 50) + '...');
      console.log(chalk.yellow('💡 Tip: Copy the base64 string and decode it to see the CAPTCHA image'));
      
      const captchaSolution = await askQuestion(chalk.blue('🔤 Enter CAPTCHA solution: '));
      
      // Step 6: Submit CAPTCHA
      const loadingCaptchaSubmit = showLoading('Submitting CAPTCHA...');
      
      const captchaResult = await withCaptcha(
        userVerification.identity,
        userVerification.digest,
        captchaSolution,
        authResult.captcha.digest,
        password
      );
      
      clearInterval(loadingCaptchaSubmit);
      process.stdout.write('\r' + ' '.repeat(30) + '\r');
      
      if (captchaResult.error) {
        console.log(chalk.red('❌ CAPTCHA verification failed: ' + captchaResult.error));
        rl.close();
        return;
      }
      
      sessionToken = captchaResult;
    } else if (authResult.isAuthenticated) {
      sessionToken = authResult.cookies;
    } else {
      console.log(chalk.red('❌ Authentication failed: ' + authResult.message));
      rl.close();
      return;
    }
    
    // Step 7: Fetch and display user info
    const loadingUserInfo = showLoading('Fetching user information...');
    
    const userInfoData = await fetchUserInfo(sessionToken);
    clearInterval(loadingUserInfo);
    process.stdout.write('\r' + ' '.repeat(30) + '\r');
    
    if (userInfoData.error) {
      console.log(chalk.red('❌ Error fetching user info: ' + userInfoData.error));
      rl.close();
      return;
    }
    
    const parsedUserInfo = await parseUserInfo(userInfoData);
    
    if (parsedUserInfo.error) {
      console.log(chalk.red('❌ Error parsing user info: ' + parsedUserInfo.error));
      rl.close();
      return;
    }
    
    // Display beautiful user info
    displayUserInfo(parsedUserInfo.userInfo);
    
    // Save session token for future use
    console.log('\n' + chalk.blue('💾 Session Token (save this for API calls):'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.white(sessionToken));
    console.log(chalk.gray('━'.repeat(50)));
    
  } catch (error) {
    console.log(chalk.red('❌ Unexpected error: ' + error.message));
  } finally {
    rl.close();
  }
};

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye!'));
  rl.close();
  process.exit(0);
});

// Start the authentication flow
authenticate();
