const dialog = document.getElementById("noticeDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");

function showNotice(title, message) {
  dialogTitle.textContent = title;
  dialogText.textContent = message;
  dialog.showModal();
}

document.getElementById("createBtn").addEventListener("click", () => {
  showNotice(
    "إنشاء الاختبار",
    "الخطوة التالية ستكون تسجيل الدخول، ثم اختيار 20 سؤالًا من البنك أو إضافة أسئلة خاصة. لم نربط الحسابات وقاعدة البيانات بعد."
  );
});

document.getElementById("closeDialog").addEventListener("click", () => dialog.close());
document.getElementById("dialogOk").addEventListener("click", () => dialog.close());

const codeInput = document.getElementById("codeInput");
codeInput.addEventListener("input", () => {
  codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6);
});

document.getElementById("joinForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const code = codeInput.value.trim();

  if (!/^\d{6}$/.test(code)) {
    showNotice("الرمز غير مكتمل", "أدخل رمزًا مكوّنًا من 6 أرقام.");
    codeInput.focus();
    return;
  }

  showNotice(
    "لم يتم ربط الاختبارات بعد",
    `أدخلت الرمز ${code}. بعد ربط قاعدة البيانات سنبحث عن الاختبار ونفتح الأسئلة.`
  );
});
