const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const toggleLink = document.getElementById('toggle-link');
const formTitle = document.getElementById('form-title');
const authButton = document.getElementById('auth-button');

/*Setting up Master Key*/
let isLogin = true;
let masterKey = '';

/*Login Page Actions*/
function toggleForm() {
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? 'Login' : 'Register';
  authButton.textContent = isLogin ? 'Login' : 'Register';
  toggleLink.textContent = isLogin ? "Don't have an account? Register" : "Already have an account? Login";
}

/*AES-128 encryption Set-Up*/
function handleAuth() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) return alert('Fill all fields');

  masterKey = prompt("Enter your master key (this will be used to encrypt/decrypt your data):");
  if (!masterKey) return alert("Master key is required.");

  let users = JSON.parse(localStorage.getItem('users')) || {};

  if (isLogin) {
    if (users[username]) {
      const decrypted = CryptoJS.AES.decrypt(users[username].password, masterKey).toString(CryptoJS.enc.Utf8);
      if (decrypted === password) {
        login(username);
        return;
      }
    }
    alert('Invalid credentials or master key');
  } else {
    if (users[username]) return alert('User already exists');
    users[username] = { password: CryptoJS.AES.encrypt(password, masterKey).toString(), data: [] };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registered successfully!');
    toggleForm();
  }
}

/*Load Passwords*/
function login(username) {
  localStorage.setItem('currentUser', username);
  authContainer.classList.add('hidden');
  mainContainer.classList.remove('hidden');
  document.getElementById('current-user').textContent = username;
  loadPasswords();
}

/*Log-Out*/
function logout() {
  localStorage.removeItem('currentUser');
  location.reload();
}

/*Saving Passwords*/
function savePassword() {
  const site = document.getElementById('site').value;
  const siteUsername = document.getElementById('site-username').value;
  const sitePassword = document.getElementById('site-password').value;
  const user = localStorage.getItem('currentUser');

  if (!site || !siteUsername || !sitePassword || !masterKey) return alert('Fill all fields');

  const encrypted = CryptoJS.AES.encrypt(sitePassword, masterKey).toString();
  let users = JSON.parse(localStorage.getItem('users'));
  users[user].data.push({ site, username: siteUsername, password: encrypted });
  localStorage.setItem('users', JSON.stringify(users));
  loadPasswords();
}

/*Load Passwords for Current Passwords*/
function loadPasswords() {
  const user = localStorage.getItem('currentUser');
  const data = JSON.parse(localStorage.getItem('users'))[user].data;
  const list = document.getElementById('password-list');
  list.innerHTML = '';
  data.forEach((entry, index) => {
    try {
      const decryptedPassword = CryptoJS.AES.decrypt(entry.password, masterKey).toString(CryptoJS.enc.Utf8);
      const item = document.createElement('div');
      item.innerHTML = `<strong>${entry.site}</strong><br>${entry.username}<br>Password: ${decryptedPassword}<hr>`;
      list.appendChild(item);
    } catch {
      const item = document.createElement('div');
      item.innerHTML = `<strong>${entry.site}</strong><br>${entry.username}<br>Password: [Incorrect Master Key]<hr>`;
      list.appendChild(item);
    }
  });
}

window.onload = () => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    masterKey = prompt("Welcome back! Please enter your master key to access your passwords:");
    if (!masterKey) {
      alert("Master key is required.");
      logout();
      return;
    }
    login(user);
  }
};
