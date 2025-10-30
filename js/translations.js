/* =========================
translations.js
Global Translation System
========================= */

// 1. قاموس الترجمة
const translations = {
    en: {
        home: "Home",
        account: "Account",
        cart: "Cart",
        settings: "Settings",
        language: "Language:",
        saveSettings: "Save Settings",
        profile: "Profile",
        profileInfo: "Profile Info",
        name: "Name",
        email: "Email",
        password: "Password",
        saveChanges: "Save Changes",
        orders: "Orders",
        myOrders: "My Orders",
        orderNumber: "Order #",
        products: "Products",
        product: "Product",
        price: "Price",
        quantity: "Quantity",
        subtotal: "Subtotal",
        remove: "Remove",
        total: "Total",
        checkout: "Checkout",
        wishlist: "Wishlist",
        clearAll: "Clear All",
        logout: "Logout",
        heroTitle: "Unleash Your Dark Style",
        heroText: "Explore the latest fashion trends with a modern dark aesthetic.",
        shopNow: "Shop Now",
        searchPlaceholder: "Search products...",
        women: "Women",
        accessories: "Accessories",
        men: "Men",
        all: "All",
        ourCollection: "Our Collection",
        copyright: "© 2025 DarkWear. All rights reserved.",
        login_title: "Login",
        login_heading: "Login",
        email_label: "Email",
        email_placeholder: "Enter your email",
        password_label: "Password",
        password_placeholder: "Enter your password",
        login_btn: "Login",
        no_account: "Don't have an account?",
        signup_link: "Sign Up",
        register_title: "Register",
        register_heading: "Sign Up",
        name_label: "Full Name",
        name_placeholder: "Enter your full name",
        confirm_password_label: "Confirm Password",
        confirm_password_placeholder: "Confirm your password",
        register_btn: "Register",
        already_account: "Already have an account?",
        login_link: "Login",
        pageTitle: "Product Details",
        productName: "Product Name",
        addToCart: "Add to Cart",
        backToStore: "Back to Store",
        login: "Login",       // ← أضفنا هذا
        Change_password_placeholder: "Change password",
        Enter_email_placeholder: "Enter email",
        Enter_name_placeholder: "Enter name",
        defaultProductDesc: "This is a stylish product perfect for your collection.",
        noOrders: "No orders yet.",
        status: "status",
        date: "Date",
        emptyWishlist: "Your wishlist is empty.",
        statusPending: "Pending",
        statusCompleted: "Completed",
        statusCancelled: "Cancelled",
            view: "View",
    addToCart: "Add to Cart",
    remove: "Remove",
    hi: "hi",
    },

    ar: {
        home: "الرئيسية",
        account: "الحساب",
        cart: "السلة",
        settings: "الإعدادات",
        language: "اللغة:",
        saveSettings: "حفظ الإعدادات",
        profile: "الملف الشخصي",
        profileInfo: "معلومات الحساب",
        name: "الاسم",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        saveChanges: "حفظ التغييرات",
        orders: "الطلبات",
        myOrders: "طلباتي",
        orderNumber: "الطلب #",
        products: "المنتجات",
        product: "المنتج",
        price: "السعر",
        quantity: "الكمية",
        subtotal: "الإجمالي الفرعي",
        remove: "إزالة",
        total: "الإجمالي",
        checkout: "إتمام الشراء",
        wishlist: "المفضلة",
        clearAll: "امسح الكل",
        logout: "تسجيل الخروج",
        heroTitle: "أطلق أسلوبك الغامض",
        heroText: "اكتشف أحدث صيحات الموضة بتصميم عصري داكن.",
        shopNow: "تسوق الآن",
        searchPlaceholder: "ابحث عن المنتجات...",
        women: "النساء",
        accessories: "الإكسسوارات",
        men: "الرجال",
        all: "الكل",
        ourCollection: "مجموعتنا",
        copyright: "© 2025 دارك وير. جميع الحقوق محفوظة.",
        login_title: "تسجيل الدخول",
        login_heading: "تسجيل الدخول",
        email_label: "البريد الإلكتروني",
        email_placeholder: "أدخل بريدك الإلكتروني",
        password_label: "كلمة المرور",
        password_placeholder: "أدخل كلمة المرور",
        login_btn: "تسجيل الدخول",
        no_account: "ليس لديك حساب؟",
        signup_link: "إنشاء حساب",
        register_title: "التسجيل",
        register_heading: "إنشاء حساب",
        name_label: "الاسم الكامل",
        name_placeholder: "أدخل اسمك الكامل",
        confirm_password_label: "تأكيد كلمة المرور",
        confirm_password_placeholder: "أعد إدخال كلمة المرور",
        register_btn: "تسجيل",
        already_account: "هل لديك حساب بالفعل؟",
        login_link: "تسجيل الدخول",
        pageTitle: "تفاصيل المنتج",
        productName: "اسم المنتج",
        addToCart: "أضف إلى السلة",
        backToStore: "العودة للمتجر",
        login: "تسجيل الدخول",   // ← أضفنا هذا
        Change_password_placeholder: "تغيير كلمة المرور",
        Enter_email_placeholder: "ادخل البريد الالكتروني",
        Enter_name_placeholder: "ادخل الاسم",
        defaultProductDesc: "هذا منتج أنيق مثالي لمجموعتك.",
        noOrders: "لا توجد طلبات حتى الآن.",
        status: "الحالة",
        date: "التاريخ",
        emptyWishlist: "المفضلة فارغة.",
        statusPending: "قيد الانتظار",
        statusCompleted: "مكتمل",
        statusCancelled: "ملغي",
            view: "عرض",
    addToCart: "أضف إلى السلة",
    remove: "إزالة",
    hi: "مرحبا",
    },
};

// 2. تحميل اللغة المحفوظة أو الإنجليزية كافتراضي
let appSettings = JSON.parse(localStorage.getItem("appSettings")) || {};
let currentLang = appSettings.language || "en";

// 3. دالة لتطبيق الترجمة على الصفحة كلها
function applyTranslations(lang) {
    document.querySelectorAll("[data-translate]").forEach((el) => {
        const key = el.getAttribute("data-translate");
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // تغيير الاتجاه
    document.body.dir = lang === "ar" ? "ltr" : "ltr";
    document.body.style.textAlign = lang === "ar" ? "left" : "left";
}

// Apply translations to normal text elements
function applyTranslationbls() {
    // العناصر اللي فيها placeholder (زي <input data-translate-placeholder="emailPlaceholder">)
    document.querySelectorAll("[data-translate-placeholder]").forEach(el => {
        const key = el.getAttribute("data-translate-placeholder");
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });
}


// 4. استدعاء الترجمة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    applyTranslations(currentLang);
    applyTranslationbls(currentLang)

    // لو فيه select للغة في الصفحة
    const langSelect = document.getElementById("language-select");
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener("change", (e) => {
            const lang = e.target.value;
            appSettings.language = lang;
            localStorage.setItem("appSettings", JSON.stringify(appSettings));
        });
    }
});
