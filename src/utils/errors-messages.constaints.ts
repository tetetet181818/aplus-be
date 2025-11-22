// ============================================
// Arabic Error Messages Constants
// ============================================

export const ErrorMessages = {
  AUTH: {
    MISSING_USER_ID: 'معرف المستخدم مطلوب، يرجى تسجيل الدخول أولاً',
    INVALID_USER_ID: 'معرف المستخدم غير صالح',
    UNAUTHORIZED: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول',
    FORBIDDEN: 'ليس لديك صلاحية للقيام بهذا الإجراء',
    SESSION_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
    INVALID_TOKEN: 'رمز المصادقة غير صالح',
    TOKEN_EXPIRED: 'انتهت صلاحية رمز المصادقة',
  },

  // ========== أخطاء العنوان ==========
  TITLE: {
    REQUIRED: 'عنوان الملخص مطلوب',
    MUST_BE_STRING: 'العنوان يجب أن يكون نصاً',
    TOO_SHORT: 'العنوان قصير جداً، يجب أن يكون {min} أحرف على الأقل',
    TOO_LONG: 'العنوان طويل جداً، يجب ألا يتجاوز {max} حرف',
    INVALID_CHARACTERS: 'العنوان يحتوي على أحرف غير مسموح بها',
    DUPLICATE: 'يوجد ملخص بنفس العنوان، يرجى اختيار عنوان آخر',
  },

  // ========== أخطاء الوصف ==========
  DESCRIPTION: {
    REQUIRED: 'وصف الملخص مطلوب',
    MUST_BE_STRING: 'الوصف يجب أن يكون نصاً',
    TOO_SHORT: 'الوصف قصير جداً، يجب أن يكون {min} أحرف على الأقل',
    TOO_LONG: 'الوصف طويل جداً، يجب ألا يتجاوز {max} حرف',
  },

  // ========== أخطاء السعر ==========
  PRICE: {
    MUST_BE_NUMBER: 'السعر يجب أن يكون رقماً',
    MUST_BE_POSITIVE: 'السعر يجب أن يكون صفر أو أكثر',
    TOO_HIGH: 'السعر مرتفع جداً، الحد الأقصى {max}',
    INVALID_FORMAT: 'صيغة السعر غير صحيحة',
  },

  // ========== أخطاء التصنيف ==========
  CATEGORY: {
    REQUIRED: 'تصنيف الملخص مطلوب',
    INVALID: 'التصنيف غير صالح',
    NOT_FOUND: 'التصنيف المحدد غير موجود',
  },

  // ========== أخطاء الصورة ==========
  IMAGE: {
    REQUIRED: 'صورة الغلاف مطلوبة',
    INVALID_TYPE: 'صيغة الصورة غير مدعومة. الصيغ المدعومة: JPG، PNG، WEBP',
    TOO_LARGE: 'حجم الصورة كبير جداً. الحد الأقصى: {max} ميجابايت',
    TOO_SMALL: 'حجم الصورة صغير جداً. الحد الأدنى: {min} كيلوبايت',
    UPLOAD_FAILED: 'فشل رفع الصورة، يرجى المحاولة مرة أخرى',
    PROCESSING_FAILED: 'فشل معالجة الصورة',
    INVALID_DIMENSIONS:
      'أبعاد الصورة غير مناسبة. الأبعاد المطلوبة: {width}x{height}',
    CORRUPTED: 'الصورة تالفة أو غير قابلة للقراءة',
  },

  // ========== أخطاء الملف ==========
  FILE: {
    REQUIRED: 'ملف PDF مطلوب',
    INVALID_TYPE: 'يجب أن يكون الملف بصيغة PDF فقط',
    TOO_LARGE: 'حجم الملف كبير جداً. الحد الأقصى: {max} ميجابايت',
    TOO_SMALL: 'حجم الملف صغير جداً',
    UPLOAD_FAILED: 'فشل رفع الملف، يرجى المحاولة مرة أخرى',
    CORRUPTED: 'الملف تالف أو غير قابل للقراءة',
    EMPTY: 'الملف فارغ',
    PROCESSING_FAILED: 'فشل معالجة الملف',
    PASSWORD_PROTECTED: 'لا يمكن رفع ملفات PDF محمية بكلمة مرور',
  },

  // ========== أخطاء الشروط والأحكام ==========
  TERMS: {
    REQUIRED: 'يجب الموافقة على الشروط والأحكام',
    MUST_ACCEPT: 'يجب قبول الشروط والأحكام للمتابعة',
  },

  // ========== أخطاء الجامعة والكلية ==========
  UNIVERSITY: {
    REQUIRED: 'اسم الجامعة مطلوب',
    INVALID: 'اسم الجامعة غير صالح',
    TOO_LONG: 'اسم الجامعة طويل جداً',
  },

  FACULTY: {
    REQUIRED: 'اسم الكلية مطلوب',
    INVALID: 'اسم الكلية غير صالح',
    TOO_LONG: 'اسم الكلية طويل جداً',
  },

  LEVEL: {
    INVALID: 'المستوى الدراسي غير صالح',
  },

  // ========== أخطاء قاعدة البيانات ==========
  DATABASE: {
    CONNECTION_FAILED: 'فشل الاتصال بقاعدة البيانات',
    QUERY_FAILED: 'فشل تنفيذ العملية في قاعدة البيانات',
    SAVE_FAILED: 'فشل حفظ البيانات',
    UPDATE_FAILED: 'فشل تحديث البيانات',
    DELETE_FAILED: 'فشل حذف البيانات',
    DUPLICATE_ENTRY: 'البيانات موجودة مسبقاً',
    NOT_FOUND: 'البيانات المطلوبة غير موجودة',
    VALIDATION_FAILED: 'فشل التحقق من البيانات في قاعدة البيانات',
  },

  // ========== أخطاء الملخص ==========
  NOTE: {
    NOT_FOUND: 'الملخص غير موجود',
    ALREADY_EXISTS: 'الملخص موجود مسبقاً',
    CREATE_FAILED: 'فشل إنشاء الملخص',
    UPDATE_FAILED: 'فشل تحديث الملخص',
    DELETE_FAILED: 'فشل حذف الملخص',
    UNAUTHORIZED_ACCESS: 'ليس لديك صلاحية للوصول لهذا الملخص',
    UNAUTHORIZED_EDIT: 'ليس لديك صلاحية لتعديل هذا الملخص',
    UNAUTHORIZED_DELETE: 'ليس لديك صلاحية لحذف هذا الملخص',
    PENDING_APPROVAL: 'الملخص قيد المراجعة',
    REJECTED: 'تم رفض الملخص',
    INACTIVE: 'الملخص غير نشط',
  },

  // ========== أخطاء الإشعارات ==========
  NOTIFICATION: {
    CREATE_FAILED: 'فشل إنشاء الإشعار',
    SEND_FAILED: 'فشل إرسال الإشعار',
  },

  // ========== أخطاء الخادم ==========
  SERVER: {
    INTERNAL_ERROR: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
    SERVICE_UNAVAILABLE: 'الخدمة غير متاحة حالياً',
    TIMEOUT: 'انتهت مهلة الطلب، يرجى المحاولة مرة أخرى',
    TOO_MANY_REQUESTS: 'طلبات كثيرة جداً، يرجى الانتظار قليلاً',
    MAINTENANCE: 'الخدمة تحت الصيانة، يرجى المحاولة لاحقاً',
  },

  // ========== أخطاء التحقق العامة ==========
  VALIDATION: {
    FAILED: 'فشل التحقق من البيانات، يرجى مراجعة الأخطاء',
    INVALID_DATA: 'البيانات المدخلة غير صالحة',
    MISSING_REQUIRED_FIELDS: 'بعض الحقول المطلوبة مفقودة',
    INVALID_FORMAT: 'صيغة البيانات غير صحيحة',
    INVALID_ID: 'المعرف غير صالح',
    INVALID_EMAIL: 'البريد الإلكتروني غير صالح',
    INVALID_PHONE: 'رقم الهاتف غير صالح',
    INVALID_URL: 'الرابط غير صالح',
    INVALID_DATE: 'التاريخ غير صالح',
  },

  // ========== رسائل النجاح ==========
  SUCCESS: {
    NOTE_CREATED: 'تم إنشاء الملخص بنجاح',
    NOTE_UPDATED: 'تم تحديث الملخص بنجاح',
    NOTE_DELETED: 'تم حذف الملخص بنجاح',
    FILE_UPLOADED: 'تم رفع الملف بنجاح',
    IMAGE_UPLOADED: 'تم رفع الصورة بنجاح',
    OPERATION_SUCCESSFUL: 'تمت العملية بنجاح',
  },
} as const;

// ============================================
// أكواد الأخطاء
// Error Codes
// ============================================

export enum ErrorCodes {
  // أخطاء المصادقة
  MISSING_USER_ID = 'AUTH_001',
  INVALID_USER_ID = 'AUTH_002',
  UNAUTHORIZED = 'AUTH_003',
  FORBIDDEN = 'AUTH_004',
  SESSION_EXPIRED = 'AUTH_005',
  INVALID_TOKEN = 'AUTH_006',

  // أخطاء العنوان
  MISSING_TITLE = 'TITLE_001',
  INVALID_TITLE = 'TITLE_002',
  TITLE_TOO_SHORT = 'TITLE_003',
  TITLE_TOO_LONG = 'TITLE_004',
  DUPLICATE_TITLE = 'TITLE_005',

  // أخطاء الوصف
  MISSING_DESCRIPTION = 'DESC_001',
  INVALID_DESCRIPTION = 'DESC_002',
  DESCRIPTION_TOO_SHORT = 'DESC_003',
  DESCRIPTION_TOO_LONG = 'DESC_004',

  // أخطاء السعر
  INVALID_PRICE = 'PRICE_001',
  PRICE_TOO_HIGH = 'PRICE_002',
  NEGATIVE_PRICE = 'PRICE_003',

  // أخطاء التصنيف
  MISSING_CATEGORY = 'CAT_001',
  INVALID_CATEGORY = 'CAT_002',

  // أخطاء الصورة
  MISSING_IMAGE = 'IMG_001',
  INVALID_IMAGE_TYPE = 'IMG_002',
  IMAGE_TOO_LARGE = 'IMG_003',
  IMAGE_UPLOAD_FAILED = 'IMG_004',
  IMAGE_CORRUPTED = 'IMG_005',

  // أخطاء الملف
  MISSING_FILE = 'FILE_001',
  INVALID_FILE_TYPE = 'FILE_002',
  FILE_TOO_LARGE = 'FILE_003',
  FILE_UPLOAD_FAILED = 'FILE_004',
  FILE_CORRUPTED = 'FILE_005',
  FILE_EMPTY = 'FILE_006',

  // أخطاء الشروط
  TERMS_NOT_ACCEPTED = 'TERMS_001',

  // أخطاء قاعدة البيانات
  DATABASE_ERROR = 'DB_001',
  DUPLICATE_ENTRY = 'DB_002',
  NOT_FOUND = 'DB_003',
  SAVE_FAILED = 'DB_004',

  // أخطاء الملخص
  NOTE_NOT_FOUND = 'NOTE_001',
  NOTE_CREATE_FAILED = 'NOTE_002',
  NOTE_UPDATE_FAILED = 'NOTE_003',
  NOTE_DELETE_FAILED = 'NOTE_004',

  // أخطاء عامة
  VALIDATION_ERROR = 'VAL_001',
  UNKNOWN_ERROR = 'ERR_001',
  SERVER_ERROR = 'ERR_002',
  TIMEOUT = 'ERR_003',
}

// ============================================
// دالة مساعدة لاستبدال المتغيرات في الرسائل
// Helper function to replace variables in messages
// ============================================

export function formatMessage(
  message: string,
  params: Record<string, string | number> = {},
): string {
  let formattedMessage = message;
  for (const [key, value] of Object.entries(params)) {
    formattedMessage = formattedMessage.replace(`{${key}}`, String(value));
  }
  return formattedMessage;
}
