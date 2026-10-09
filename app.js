import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

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
const googleProvider = new GoogleAuthProvider();

const dialog = document.getElementById("noticeDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");

function showNotice(title, message) {
  dialogTitle.textContent = title;
  dialogText.textContent = message;
  if (!dialog.open) dialog.showModal();
}

document.getElementById("closeDialog")
  .addEventListener("click", () => dialog.close());

document.getElementById("dialogOk")
  .addEventListener("click", () => dialog.close());

function friendlyError(error) {
  const messages = {
    "auth/email-already-in-use": "هذا البريد مسجل بالفعل.",
    "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
    "auth/weak-password": "اختر كلمة مرور أقوى، من 6 أحرف على الأقل.",
    "auth/invalid-credential": "البريد أو كلمة المرور غير صحيحة.",
    "auth/popup-closed-by-user": "أ​غلقت نافذة Google قبل إكمال الدخول.",
    "auth/unauthorized-domain": "أضف نطاق موقعك إلى النطاقات المسموح بها في Firebase."
  };

  return messages[error.code] ||
    "تعذر إكمال العملية. تحقق من الاتصال وإعدادات Firebase.";
}

function openAuth() {
  if (document.getElementById("authForm")) return;

  const container = document.createElement("div");
  container.id = "authForm";
  container.style.cssText =
    "display:grid;gap:12px;margin-top:16px;text-align:right";

  container.innerHTML = `
    <label for="authEmail">البريد الإلكتروني</label>
    <input id="authEmail" type="email" autocomplete="email"
      placeholder="name@example.com" required>

    <label for="authPassword">كلمة المرور</label>
    <input id="authPassword" type="password"
      autocomplete="current-password" minlength="6"
      placeholder="6 أحرف على الأقل" required>

    <button class="button button-primary" id="registerBtn" type="button">
      إنشاء حساب
    </button>
    <button class="button button-secondary" id="loginBtn" type="button">
      تسجيل الدخول بالبريد
    </button>
    <button class="button button-secondary" id="googleBtn" type="button">
      المتابعة باستخدام Google
    </button>
  `;

  dialogText.insertAdjacentElement("afterend", container);
  dialogText.textContent =
    "أنشئ حسابًا جديدًا أو سج​ل الدخول للمتابعة.";

  document.getElementById("registerBtn").onclick = async () => {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;

    if (!email || password.length < 6) {
      showNotice("تحقق من البيانات",
        "أدخل بريدًا صحيحًا وكلمة مرور من 6 أحرف على الأقل.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      container.remove();
      showNotice("أهلًا بك!", "تم إنشاء حسابك وتسجيل دخولك بنجاح.");
    } catch (error) {
      showNotice("تعذر إنشاء الحساب", friendlyError(error));
    }
  };

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      container.remove();
      showNotice("مرحبًا بعودتك", "تم تسجيل الدخول بنجاح.");
    } catch (error) {
      showNotice("تعذر تسجيل الدخول", friendlyError(error));
    }
  };

  document.getElementById("googleBtn").onclick = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      container.remove();
      showNotice("تم تسجيل الدخول", "أهلًا بك في TRUEBOND.");
    } catch (error) {
      showNotice("تعذر تسجيل الدخول باستخدام Google",
        friendlyError(error));
    }
  };
}

document.getElementById("createBtn").addEventListener("click", () => {
  if (auth.currentUser) {
    showNotice("أهلًا بك", "تم تسجيل دخولك. سنضيف محرر الاختبارات في المرحلة التالية.");
  } else {
    showNotice("أنشئ حسابك أولًا",
      "سج​ل الدخول أو أنشئ حسابًا حتى نتابع إنشاء اختبارك.");
    openAuth();
  }
});

const codeInput = document.getElementById("codeInput");

codeInput.addEventListener("input", () => {
  codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6);
});

document.getElementById("joinForm").addEventListener("submit", event => {
  event.preventDefault();
  const code = codeInput.value.trim();

  if (!/^\d{6}$/.test(code)) {
    showNotice("الرمز غير مكتمل", "أدخل رمزًا مكونًا من 6 أرقام.");
    codeInput.focus();
    return;
  }

  showNotice("سنكمل هذه الوظيفة لاحقًا",
    "تسجيل الدخول جاهز للربط. سنضيف البحث عن الاختبار في Firestore في المرحلة التالية.");
});

onAuthStateChanged(auth, user => {
  console.log(user
    ? "TRUEBOND: المستخدم مسجل الدخول."
    : "TRUEBOND: لا يوجد مستخدم مسجل الدخول.");
});
