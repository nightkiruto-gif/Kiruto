import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXaXLDNpRpJ2y4C6r6HnJw1CKVBcneBDM",
  authDomain: "truebond-f19fc.firebaseapp.com",
  projectId: "truebond-f19fc",
  storageBucket: "truebond-f19fc.firebasestorage.app",
  messagingSenderId: "1053516920339",
 appId: "1:1053516920339:web:c62ea7f50a9f675f8a31e6",
  measurementId: "G-RKN73F81MM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const dialog = document.getElementById("noticeDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");

function showNotice(title, message) {
  dialogTitle.textContent = title;
  dialogText.textContent = message;
  if (!dialog.open) dialog.showModal();
}

document.getElementById("closeDialog").onclick = () => dialog.close();
document.getElementById("dialogOk").onclick = () => dialog.close();

function friendlyError(error) {
  const messages = {
    "auth/email-already-in-use": "هذا البريد مسجل بالفعل.",
    "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
    "auth/weak-password": "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
    "auth/invalid-credential": "البريد أو كلمة المرور غير صحيحة.",
    "auth/unauthorized-domain": "أضف نطاق موقعك إلى النطاقات المسموح بها في Firebase.",
    "permission-denied": "قواعد Firestore لا تسمح بهذه العملية بعد."
  };
  return messages[error.code] || error.message || "حدث خطأ. حاول مجددًا.";
}

function openAuth() {
  let box = document.getElementById("authForm");
  if (box) {
    dialogText.textContent = "سجل الدخول أو أنشئ حسابًا للمتابعة.";
    dialog.showModal();
    return;
  }

  box = document.createElement("div");
  box.id = "authForm";
  box.style.cssText = "display:grid;gap:12px;margin-top:16px;text-align:right";
  box.innerHTML = `
    <label for="authEmail">البريد الإلكتروني</label>
    <input id="authEmail" type="email" autocomplete="email" placeholder="name@example.com">
    <label for="authPassword">كلمة المرور</label>
    <input id="authPassword" type="password" autocomplete="current-password" minlength="6" placeholder="6 أحرف على الأقل">
    <button class="button button-primary" id="registerBtn" type="button">إنشاء حساب</button>
    <button class="button button-secondary" id="loginBtn" type="button">تسجيل الدخول بالبريد</button>
    <button class="button button-secondary" id="googleBtn" type="button">المتابعة باستخدام Google</button>
  `;
  dialogText.insertAdjacentElement("afterend", box);
  dialogText.textContent = "أنشئ حسابًا جديدًا أو سجل الدخول.";

  document.getElementById("registerBtn").onclick = async () => {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      dialog.close();
      showNotice("أهلًا بك!", "تم إنشاء حسابك بنجاح.");
    } catch (e) {
      showNotice("تعذر إنشاء الحساب", friendlyError(e));
    }
  };

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      dialog.close();
      showNotice("مرحبًا بعودتك", "تم تسجيل الدخول بنجاح.");
    } catch (e) {
      showNotice("تعذر تسجيل الدخول", friendlyError(e));
    }
  };

  document.getElementById("googleBtn").onclick = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      dialog.close();
      showNotice("أهلًا بك", "تم تسجيل الدخول باستخدام Google.");
    } catch (e) {
      showNotice("تعذر تسجيل الدخول", friendlyError(e));
    }
  };

  dialog.showModal();
}

function ask(title, placeholder, value = "") {
  return new Promise(resolve => {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:grid;gap:12px;margin-top:12px";
    const input = document.createElement("input");
    input.placeholder = placeholder;
    input.value = value;
    input.style.cssText = "width:100%;padding:12px;border-radius:10px";
    const yes = document.createElement("button");
    yes.className = "button button-primary";
    yes.textContent = "متابعة";
    const no = document.createElement("button");
    no.className = "button button-secondary";
    no.textContent = "إلغاء";
    wrap.append(input, yes, no);
    dialogText.insertAdjacentElement("afterend", wrap);
    dialogTitle.textContent = title;
    dialogText.textContent = "";
    dialog.showModal();
    yes.onclick = () => {
      const result = input.value.trim();
      wrap.remove();
      dialog.close();
      resolve(result || null);
    };
    no.onclick = () => {
      wrap.remove();
      dialog.close();
      resolve(null);
    };
  });
}

async function createQuiz() {
  const title = await ask("اسم الاختبار", "مثال: هل تعرفني حقًا؟");
  if (!title) return;

  const questions = [];
  for (let i = 0; i < 5; i++) {
    const question = await ask(`السؤال ${i + 1} من 5`, "اكتب السؤال");
    if (!question) break;
    const correct = await ask("الإجابة الصحيحة", "اكتب الإجابة الصحيحة");
    if (!correct) break;
    questions.push({ question, correct });
  }

  if (!questions.length) {
    showNotice("لم ي​نشأ الاختبار", "أضف سؤالًا واحدًا على الأقل.");
    return;
  }

  try {
    let code;
    let ref;
    for (let tries = 0; tries < 5; tries++) {
      code = String(Math.floor

