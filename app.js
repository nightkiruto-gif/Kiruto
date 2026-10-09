```javascript
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
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

/* =========================
   إعدادات Firebase
========================= */

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

/* =========================
   عناصر الصفحة
========================= */

const dialog = document.getElementById("noticeDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");
const dialogOk = document.getElementById("dialogOk");
const closeDialog = document.getElementById("closeDialog");

const createBtn = document.getElementById("createBtn");
const joinForm = document.getElementById("joinForm");
const codeInput = document.getElementById("codeInput");

/* =========================
   رسائل الأخطاء
========================= */

function errorMessage(error) {
  const messages = {
    "auth/email-already-in-use":
      "هذا البريد الإلكتروني مسجل بالفعل.",

    "auth/invalid-email":
      "البريد الإلكتروني غير صحيح.",

    "auth/weak-password":
      "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",

    "auth/invalid-credential":
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

    "auth/popup-closed-by-user":
      "أغلقت نافذة Google قبل إكمال تسجيل الدخول.",

    "auth/popup-blocked":
      "المتصفح منع نافذة Google. جرّب تسجيل الدخول بالبريد.",

    "auth/unauthorized-domain":
      "أضف نطاق موقعك إلى Authorized domains في Firebase.",

    "permission-denied":
      "رفضت قواعد Firestore العملية. تحقق من تسجيل الدخول وقواعد قاعدة البيانات.",

    "unavailable":
      "تعذر الاتصال بـ Firebase. تحقق من الإنترنت وحاول مجددًا."
  };

  return messages[error?.code] ||
    error?.message ||
    "حدث خطأ غير معروف.";
}

/* =========================
   نافذة الإشعارات
========================= */

function showNotice(title, message) {
  if (!dialog || !dialogTitle || !dialogText) {
    alert(title + "\n\n" + message);
    return;
  }

  const oldArea = dialog.querySelector("[data-dynamic]");
  if (oldArea) oldArea.remove();

  dialogTitle.textContent = title;
  dialogText.textContent = message;
  dialogText.style.whiteSpace = "pre-line";

  if (dialogOk) dialogOk.hidden = false;
  if (closeDialog) closeDialog.hidden = false;

  if (!dialog.open) dialog.showModal();
}

function closeActiveDialog() {
  if (!dialog) return;

  const area = dialog.querySelector("[data-dynamic]");
  if (area) area.remove();

  if (dialogOk) dialogOk.hidden = false;
  if (closeDialog) closeDialog.hidden = false;

  if (dialog.open) dialog.close();
}

function addArea() {
  if (!dialog || !dialogText) {
    throw new Error(
      "لم يتم العثور على نافذة noticeDialog أو dialogText في index.html."
    );
  }

  const oldArea = dialog.querySelector("[data-dynamic]");
  if (oldArea) oldArea.remove();

  const area = document.createElement("div");
  area.dataset.dynamic = "true";
  area.style.display = "grid";
  area.style.gap = "10px";
  area.style.marginTop = "12px";

  dialogText.insertAdjacentElement("afterend", area);

  if (dialogOk) dialogOk.hidden = true;
  if (closeDialog) closeDialog.hidden = true;

  return area;
}

function makeInput(area, placeholder, type = "text") {
  const input = document.createElement("input");

  input.type = type;
  input.placeholder = placeholder;
  input.setAttribute("aria-label", placeholder);
  input.autocomplete = "off";

  input.style.padding = "12px";
  input.style.width = "100%";
  input.style.boxSizing = "border-box";
  input.style.borderRadius = "8px";

  area.appendChild(input);

  return input;
}

function makeButton(area, text, callback) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = text;
  button.style.padding = "12px";
  button.style.borderRadius = "8px";

  button.addEventListener("click", callback);

  area.appendChild(button);

  return button;
}

/* =========================
   تسجيل الدخول
========================= */

function openAuth() {
  if (!dialog) {
    alert("تعذر فتح نافذة تسجيل الدخول.");
    return;
  }

  closeActiveDialog();

  dialogTitle.textContent = "تسجيل الدخول إلى TRUEBOND";
  dialogText.textContent =
    "سجّل الدخول أو أنشئ حسابًا للمتابعة.";

  const area = addArea();

  const email = makeInput(
    area,
    "البريد الإلكتروني",
    "email"
  );

  const password = makeInput(
    area,
    "كلمة المرور",
    "password"
  );

  makeButton(area, "تسجيل الدخول بالبريد", async () => {
    try {
      if (!email.value.trim() || !password.value) {
        dialogText.textContent =
          "أدخل البريد الإلكتروني وكلمة المرور.";
        return;
      }

      await signInWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );

      closeActiveDialog();

      showNotice(
        "مرحبًا بك!",
        "تم تسجيل الدخول بنجاح."
      );
    } catch (error) {
      console.error("Email login error:", error);
      dialogText.textContent = errorMessage(error);
    }
  });

  makeButton(area, "إنشاء حساب بالبريد", async () => {
    try {
      if (
        !email.value.trim() ||
        password.value.length < 6
      ) {
        dialogText.textContent =
          "أدخل بريدًا صحيحًا وكلمة مرور من 6 أحرف على الأقل.";
        return;
      }

      await createUserWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );

      closeActiveDialog();

      showNotice(
        "تم إنشاء الحساب",
        "يمكنك الآن استخدام TRUEBOND."
      );
    } catch (error) {
      console.error("Account creation error:", error);
      dialogText.textContent = errorMessage(error);
    }
  });

  makeButton(
    area,
    "تسجيل الدخول باستخدام Google",
    async () => {
      try {
        await signInWithPopup(auth, googleProvider);

        closeActiveDialog();

        showNotice(
          "مرحبًا بك!",
          "تم تسجيل الدخول باستخدام Google."
        );
      } catch (error) {
        console.error("Google login error:", error);
        dialogText.textContent = errorMessage(error);
      }
    }
  );

  makeButton(area, "إغلاق", closeActiveDialog);

  if (!dialog.open) dialog.showModal();
}

/* =========================
   إدخال البيانات
========================= */

function ask(title, placeholder) {
  return new Promise((resolve) => {
    if (!dialog) {
      resolve(prompt(title, placeholder) || "");
      return;
    }

    closeActiveDialog();

    dialogTitle.textContent = title;
    dialogText.textContent = "";

    const area = addArea();
    const input = makeInput(area, placeholder);

    let finished = false;

    function finish(value) {
      if (finished) return;

      finished = true;
      closeActiveDialog();
      resolve(value);
    }

    makeButton(area, "متابعة", () => {
      finish(input.value.trim());
    });

    makeButton(area, "إلغاء", () => {
      finish("");
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(input.value.trim());
      }
    });

    if (!dialog.open) dialog.showModal();

    input.focus();
  });
}

/* =========================
   إنشاء الاختبار
========================= */

async function createQuiz() {
  if (!auth.currentUser) {
    openAuth();
    return;
  }

  const title = await ask(
    "اسم الاختبار",
    "مثال: هل تعرفني حقًا؟"
  );

  if (!title) return;

  const questions = [];

  for (let i = 0; i < 5; i++) {
    const question = await ask(
      `السؤال ${i + 1} من 5`,
      "اكتب السؤال"
    );

    if (!question) {
      if (questions.length === 0) return;
      break;
    }

    const correct = await ask(
      "الإجابة الصحيحة",
      "اكتب الإجابة الصحيحة"
    );

    if (!correct) {
      if (questions.length === 0) return;
      break;
    }

    questions.push({
      question: question,
      correct: correct
    });
  }

  if (questions.length === 0) {
    showNotice(
      "لم يُنشأ الاختبار",
      "أضف سؤالًا واحدًا على الأقل."
    );
    return;
  }

  try {
    showNotice(
      "جارٍ إنشاء الاختبار",
      "يرجى الانتظار..."
    );

    let code = null;
    let quizRef = null;

    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = String(
        Math.floor(100000 + Math.random() * 900000)
      );

      const candidateRef = doc(
        db,
        "quizzes",
        candidate
      );

      const existing = await getDoc(candidateRef);

      if (!existing.exists()) {
        code = candidate;
        quizRef = candidateRef;
        break;
      }
    }

    if (!quizRef) {
      throw new Error(
        "تعذر إنشاء رمز فريد. حاول مرة أخرى."
      );
    }

    await setDoc(quizRef, {
      title: title,
      ownerUid: auth.currentUser.uid,
      ownerName:
        auth.currentUser.displayName ||
        auth.currentUser.email ||
        "مستخدم TRUEBOND",
      questions: questions,
      createdAt: serverTimestamp()
    });

    showNotice(
      "تم إنشاء الاختبار بنجاح!",
      `عنوان الاختبار: ${title}\n` +
      `رمز المشاركة: ${code}\n\n` +
      "أرسل الرمز إلى أصدقائك ليتمكنوا من المشاركة."
    );
  } catch (error) {
    console.error("Create quiz error:", error);

    showNotice(
      "تعذر حفظ الاختبار",
      errorMessage(error)
    );
  }
}

/* =========================
   ربط زر إنشاء الاختبار
========================= */

if (createBtn) {
  createBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    if (createBtn.dataset.busy === "true") return;

    createBtn.dataset.busy = "true";

    try {
      await createQuiz();
    } catch (error) {
      console.error("Create button error:", error);

      showNotice(
        "حدث خطأ",
        errorMessage(error)
      );
    } finally {
      delete createBtn.dataset.busy;
    }
  });
} else {
  console.error(
    'TRUEBOND: لم يتم العثور على عنصر يحمل id="createBtn".'
  );
}

/* =========================
   الانضمام إلى اختبار
========================= */

async function joinQuiz(code) {
  if (!auth.currentUser) {
    openAuth();
    return;
  }

  try {
    const quizRef = doc(db, "quizzes", code);
    const quizSnapshot = await getDoc(quizRef);

    if (!quizSnapshot.exists()) {
      showNotice(
        "الاختبار غير موجود",
        "تحقق من رمز المشاركة."
      );
      return;
    }

    const quiz = quizSnapshot.data();

    if (
      !Array.isArray(quiz.questions) ||
      quiz.questions.length === 0
    ) {
      showNotice(
        "اختبار غير صالح",
        "لا توجد أسئلة في هذا الاختبار."
      );
      return;
    }

    const answers = [];
    let score = 0;

    for (let i = 0; i < quiz.questions.length; i++) {
      const item = quiz.questions[i];

      const answer = await ask(
        `السؤال ${i + 1} من ${quiz.questions.length}`,
        item.question
      );

      if (!answer) {
        showNotice(
          "تم إلغاء الاختبار",
          "لم يتم إرسال إجاباتك."
        );
        return;
      }

      answers.push(answer);

      if (
        answer.trim().toLowerCase() ===
        String(item.correct).trim().toLowerCase()
      ) {
        score++;
      }
    }

    await addDoc(
      collection(db, "quizzes", code, "attempts"),
      {
        userUid: auth.currentUser.uid,
        userName:
          auth.currentUser.displayName ||
          auth.currentUser.email ||
          "مستخدم TRUEBOND",
        answers: answers,
        score: score,
        total: quiz.questions.length,
        createdAt: serverTimestamp()
      }
    );

    showNotice(
      "اكتملت الإجابات!",
      `الاختبار: ${quiz.title}\n` +
      `نتيجتك: ${score} من ${quiz.questions.length}`
    );
  } catch (error) {
    console.error("Join quiz error:", error);

    showNotice(
      "تعذر إكمال الاختبار",
      errorMessage(error)
    );
  }
}

/* =========================
   ربط نموذج رمز المشاركة
========================= */

if (joinForm) {
  joinForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const code = String(
      codeInput?.value || ""
    ).trim();

    if (!/^\d{6}$/.test(code)) {
      showNotice(
        "رمز غير صحيح",
        "أدخل رمزًا مكونًا من 6 أرقام."
      );
      return;
    }

    if (!auth.currentUser) {
      openAuth();
      return;
    }

    await joinQuiz(code);
  });
} else {
  console.warn(
    'TRUEBOND: لم يتم العثور على نموذج id="joinForm".'
  );
}

/* =========================
   إغلاق النوافذ
========================= */

if (closeDialog) {
  closeDialog.addEventListener(
    "click",
    closeActiveDialog
  );
}

if (dialogOk) {
  dialogOk.addEventListener(
    "click",
    closeActiveDialog
  );
}

/* =========================
   مراقبة تسجيل الدخول
========================= */

onAuthStateChanged(auth, (user) => {
  console.log(
    user
      ? "TRUEBOND: تم تسجيل الدخول"
      : "TRUEBOND: لا يوجد مستخدم مسجل الدخول"
  );
});
```
