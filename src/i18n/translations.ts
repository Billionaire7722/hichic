import {
  virtualTryOnMessages,
  type VirtualTryOnMessages,
} from './virtualTryOnTranslations'

export type Locale = 'en' | 'vi'

export type ProductCopy = {
  name: string
  category: string
  description: string
}

export type Messages = {
  metaTitle: string
  metaDescription: string
  skipToContent: string
  ariaNavPrimary: string
  nav: {
    collection: string
    craft: string
    virtualTryOn: string
    updates: string
  }
  header: { shop: string }
  langSwitcher: { label: string; en: string; vi: string }
  hero: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    lede: string
    ctaPrimary: string
    ctaSecondary: string
    ctaVirtualTryOn: string
  }
  collection: {
    label: string
    heading: string
    copy: string
  }
  editorial: {
    label: string
    title: string
    body: string
    bullet1: string
    bullet2: string
    bullet3: string
  }
  newsletter: {
    title: string
    text: string
    emailLabel: string
    placeholder: string
    submit: string
  }
  footer: {
    tagline: string
    shopHeading: string
    skirts: string
    blouses: string
    virtualTryOn: string
    updates: string
    companyHeading: string
    craft: string
    careersSoon: string
    pressSoon: string
    legal: string
  }
  products: Record<string, ProductCopy>
  virtualTryOn: VirtualTryOnMessages
}

export const messages: Record<Locale, Messages> = {
  en: {
    metaTitle: 'Hichic — Office wear',
    metaDescription:
      'Hichic — refined office wear: pencil skirts, silk blouses, and tailoring for the workday.',
    skipToContent: 'Skip to content',
    ariaNavPrimary: 'Primary',
    nav: {
      collection: 'Collection',
      craft: 'Craft',
      virtualTryOn: 'Virtual Try-On',
      updates: 'Updates',
    },
    header: { shop: 'Shop' },
    langSwitcher: {
      label: 'Language',
      en: 'EN',
      vi: 'VI',
    },
    hero: {
      eyebrow: 'Office essentials',
      titleLine1: 'Tailoring & silk,',
      titleLine2: 'built for nine-to-nine.',
      lede:
        'Pencil skirts with precision creases. Blouses in washed silk. Quiet pieces that read sharp under fluorescent light and soft after hours.',
      ctaPrimary: 'View collection',
      ctaSecondary: 'Our approach',
      ctaVirtualTryOn: 'Try Virtual Try-On',
    },
    collection: {
      label: 'New arrivals',
      heading: 'Skirts & blouses',
      copy:
        'Washed silks, pressed creases, and linings chosen for real desks and real seasons.',
    },
    editorial: {
      label: 'Craft',
      title: 'Cut for desks, commutes, and the evening crossover.',
      body:
        'We pattern-test on real bodies and real chairs: sleeves that clear the keyboard, skirts that stay centered when you walk to the conference room. Fabrics are chosen for breathability and recovery — silk that still looks intentional at 6 p.m.',
      bullet1: 'Small-batch production partners in Porto & Shanghai',
      bullet2: 'OEKO-TEX® certified linings where applicable',
      bullet3: 'Complimentary hemming on launch orders',
    },
    newsletter: {
      title: 'Notes from the studio',
      text: 'Occasional drops, fit guides, and fabric stories. No daily noise.',
      emailLabel: 'Email',
      placeholder: 'you@company.com',
      submit: 'Join',
    },
    footer: {
      tagline: 'Office wear, quietly luxurious.',
      shopHeading: 'Shop',
      skirts: 'Skirts',
      blouses: 'Blouses',
      virtualTryOn: 'Virtual Try-On',
      updates: 'Updates',
      companyHeading: 'Company',
      craft: 'Craft',
      careersSoon: 'Careers (soon)',
      pressSoon: 'Press (soon)',
      legal: 'Images via Unsplash placeholders.',
    },
    products: {
      '1': {
        name: 'Silk Charmeuse Blouse',
        category: 'Tops',
        description: 'Bias-cut collar, mother-of-pearl buttons, fluid drape.',
      },
      '2': {
        name: 'Tailored Pencil Skirt',
        category: 'Skirts',
        description: 'High-rise, lined, with a clean back vent for movement.',
      },
      '3': {
        name: 'Crêpe Shell Top',
        category: 'Tops',
        description: 'Minimal seams, invisible zipper — layers under blazers.',
      },
      '4': {
        name: 'Midi Pencil Skirt',
        category: 'Skirts',
        description: 'Wool blend, pressed crease, sits at the natural waist.',
      },
    },
    virtualTryOn: virtualTryOnMessages.en,
  },
  vi: {
    metaTitle: 'Hichic — Thời trang công sở',
    metaDescription:
      'Hichic — thời trang công sở tinh tế: chân váy bút chì, áo lụa và form dáng may đo cho ngày làm việc.',
    skipToContent: 'Chuyển tới nội dung',
    ariaNavPrimary: 'Chính',
    nav: {
      collection: 'Bộ sưu tập',
      craft: 'Chất liệu',
      virtualTryOn: 'Thử đồ ảo',
      updates: 'Cập nhật',
    },
    header: { shop: 'Mua sắm' },
    langSwitcher: {
      label: 'Ngôn ngữ',
      en: 'EN',
      vi: 'VI',
    },
    hero: {
      eyebrow: 'Thời trang công sở',
      titleLine1: 'May đo & lụa,',
      titleLine2: 'cho cả ngày dài.',
      lede:
        'Chân váy bút chì với nếp gấp tinh xảo. Áo lụa mềm. Những thiết kế trầm lặng nhưng vẫn sắc nét dưới đèn huỳnh quang và dịu dàng sau giờ làm.',
      ctaPrimary: 'Xem bộ sưu tập',
      ctaSecondary: 'Cách chúng tôi làm',
      ctaVirtualTryOn: 'Thử đồ ảo',
    },
    collection: {
      label: 'Hàng mới',
      heading: 'Chân váy & áo',
      copy:
        'Lụa mềm, nếp phẳng và lót trong được chọn cho bàn làm việc thật và từng mùa.',
    },
    editorial: {
      label: 'Chất liệu',
      title: 'Cắt may cho bàn làm việc, chuyến đi, và buổi tối sau đó.',
      body:
        'Chúng tôi thử form trên người thật và ghế thật: tay áo không chạm bàn phím, chân váy giữ phom khi bạn bước vào phòng họp. Chọn vải thông thoáng và giữ dáng — lụa vẫn chỉn chu lúc 18 giờ.',
      bullet1: 'Đối tác sản xuất nhỏ tại Porto và Thượng Hải',
      bullet2: 'Lót trong có chứng nhận OEKO-TEX® khi áp dụng',
      bullet3: 'Miễn phí chỉnh lai cho đơn hàng trong đợt ra mắt',
    },
    newsletter: {
      title: 'Tin từ xưởng',
      text: 'Ra mắt lẻ tẻ, gợi ý phom dáng và câu chuyện vải. Không làm phiền hằng ngày.',
      emailLabel: 'Email',
      placeholder: 'ban@congty.com',
      submit: 'Đăng ký',
    },
    footer: {
      tagline: 'Thời trang công sở, tinh tế và trầm.',
      shopHeading: 'Mua sắm',
      skirts: 'Chân váy',
      blouses: 'Áo',
      virtualTryOn: 'Thử đồ ảo',
      updates: 'Cập nhật',
      companyHeading: 'Công ty',
      craft: 'Chất liệu',
      careersSoon: 'Tuyển dụng (sắp có)',
      pressSoon: 'Báo chí (sắp có)',
      legal: 'Hình ảnh minh họa từ Unsplash.',
    },
    products: {
      '1': {
        name: 'Áo lụa charmeuse',
        category: 'Áo',
        description: 'Cổ cắt bias, khuy ngọc trai, dáng rủ mềm.',
      },
      '2': {
        name: 'Chân váy bút chì may đo',
        category: 'Chân váy',
        description: 'Cạp cao, có lót, xẻ sau gọn giúp cử động thoải mái.',
      },
      '3': {
        name: 'Áo cổ đổ crêpe',
        category: 'Áo',
        description: 'Đường may tối giản, khóa ẩn — dễ phối trong blazer.',
      },
      '4': {
        name: 'Chân váy bút chì midi',
        category: 'Chân váy',
        description: 'Len pha, nếp giữa phẳng, ôm eo tự nhiên.',
      },
    },
    virtualTryOn: virtualTryOnMessages.vi,
  },
}
