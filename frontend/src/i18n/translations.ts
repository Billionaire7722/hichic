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
  commerce: {
    home: {
      newArrivalsTitle: string
      newArrivalsCopy: string
      seeAll: string
      collectionTitle: string
      collectionCopy: string
    }
    collectionsPage: {
      title: string
      intro: string
      filtersLabel: string
      allCollections: string
      productCount: string
      emptyTitle: string
      emptyText: string
      viewDetails: string
    }
    product: {
      backToCollections: string
      collection: string
      chooseSize: string
      chooseColor: string
      addToCart: string
      tryOn: string
      details: string
      detailsText: string
      care: string
      careText: string
      shipping: string
      shippingText: string
    }
    cart: {
      title: string
      intro: string
      emptyTitle: string
      continueShopping: string
      orderSummary: string
      quantity: string
      subtotal: string
      shipping: string
      shippingValue: string
      total: string
      paymentInfo: string
      contactInfo: string
      fullName: string
      email: string
      phone: string
      address: string
      cardName: string
      cardNumber: string
      expiry: string
      cvc: string
      savePayment: string
      paymentNote: string
      confirmation: string
    }
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
      label: '',
      heading: 'Collections',
      copy:
        'Explore polished office pieces by the way they fit into your workweek.',
    },
    commerce: {
      home: {
        newArrivalsTitle: 'New arrivals',
        newArrivalsCopy: 'The newest products added by the Hichic admin team.',
        seeAll: 'See all',
        collectionTitle: 'Collection',
        collectionCopy: 'Three edited wardrobes that can be managed from the admin collections page.',
      },
      collectionsPage: {
        title: 'Collections',
        intro:
          'Browse the same Hichic edits from the homepage, then filter by collection to compare pieces for the office, commute, and evening plans.',
        filtersLabel: 'Filter by collection',
        allCollections: 'All collections',
        productCount: 'pieces',
        emptyTitle: 'No pieces in this collection yet.',
        emptyText: 'Choose another collection or return to the full edit.',
        viewDetails: 'View details',
      },
      product: {
        backToCollections: 'Back to collections',
        collection: 'Collection',
        chooseSize: 'Choose size',
        chooseColor: 'Choose color',
        addToCart: 'Add to cart',
        tryOn: 'Try Virtual Try-On',
        details: 'Details',
        detailsText:
          'Cut for a clean office line with enough ease for desks, commutes, and long meeting days.',
        care: 'Care',
        careText:
          'Steam lightly, hang after wear, and dry clean when the lining needs a full refresh.',
        shipping: 'Shipping',
        shippingText:
          'Complimentary domestic delivery, with hemming notes reviewed before dispatch.',
      },
      cart: {
        title: 'Cart & payment',
        intro:
          'Review the selected piece and keep the payment fields ready for checkout handoff.',
        emptyTitle: 'Your cart is ready for a piece.',
        continueShopping: 'Continue shopping',
        orderSummary: 'Order summary',
        quantity: 'Quantity',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        shippingValue: 'Complimentary',
        total: 'Total',
        paymentInfo: 'Payment information',
        contactInfo: 'Contact information',
        fullName: 'Full name',
        email: 'Email',
        phone: 'Phone',
        address: 'Delivery address',
        cardName: 'Name on card',
        cardNumber: 'Card number',
        expiry: 'Expiry',
        cvc: 'CVC',
        savePayment: 'Save payment information',
        paymentNote: 'Demo payment details are filled in for frontend review only.',
        confirmation: 'Payment information saved for this checkout preview.',
      },
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
      '5': {
        name: 'Sandline Blazer',
        category: 'Blazers',
        description: 'Structured shoulders and a soft linen-viscose drape.',
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
      label: '',
      heading: 'Bộ sưu tập',
      copy:
        'Khám phá các thiết kế công sở theo cách chúng đồng hành trong tuần làm việc.',
    },
    commerce: {
      home: {
        newArrivalsTitle: 'Hàng mới',
        newArrivalsCopy: 'Những sản phẩm mới nhất được thêm từ trang quản trị Hichic.',
        seeAll: 'Xem tất cả',
        collectionTitle: 'Bộ sưu tập',
        collectionCopy: 'Ba nhóm trang phục có thể thêm, sửa hoặc xóa từ trang quản trị bộ sưu tập.',
      },
      collectionsPage: {
        title: 'Bộ sưu tập',
        intro:
          'Xem lại các nhóm sản phẩm Hichic trên trang chủ, rồi lọc theo bộ sưu tập để so sánh trang phục cho văn phòng, di chuyển và buổi tối.',
        filtersLabel: 'Lọc theo bộ sưu tập',
        allCollections: 'Tất cả bộ sưu tập',
        productCount: 'sản phẩm',
        emptyTitle: 'Chưa có sản phẩm trong bộ sưu tập này.',
        emptyText: 'Chọn bộ sưu tập khác hoặc quay lại toàn bộ danh sách.',
        viewDetails: 'Xem chi tiết',
      },
      product: {
        backToCollections: 'Quay lại bộ sưu tập',
        collection: 'Bộ sưu tập',
        chooseSize: 'Chọn kích cỡ',
        chooseColor: 'Chọn màu',
        addToCart: 'Thêm vào giỏ',
        tryOn: 'Thử đồ ảo',
        details: 'Chi tiết',
        detailsText:
          'Phom gọn cho công sở nhưng vẫn đủ thoải mái khi ngồi làm việc, di chuyển và họp dài.',
        care: 'Chăm sóc',
        careText:
          'Hấp hơi nhẹ, treo sau khi mặc và giặt khô khi lớp lót cần làm mới toàn bộ.',
        shipping: 'Giao hàng',
        shippingText:
          'Miễn phí giao hàng nội địa, ghi chú chỉnh lai được kiểm tra trước khi gửi.',
      },
      cart: {
        title: 'Giỏ hàng & thanh toán',
        intro:
          'Kiểm tra sản phẩm đã chọn và giữ sẵn thông tin thanh toán cho bước checkout.',
        emptyTitle: 'Giỏ hàng đang chờ sản phẩm.',
        continueShopping: 'Tiếp tục mua sắm',
        orderSummary: 'Tóm tắt đơn hàng',
        quantity: 'Số lượng',
        subtotal: 'Tạm tính',
        shipping: 'Giao hàng',
        shippingValue: 'Miễn phí',
        total: 'Tổng cộng',
        paymentInfo: 'Thông tin thanh toán',
        contactInfo: 'Thông tin liên hệ',
        fullName: 'Họ và tên',
        email: 'Email',
        phone: 'Điện thoại',
        address: 'Địa chỉ giao hàng',
        cardName: 'Tên trên thẻ',
        cardNumber: 'Số thẻ',
        expiry: 'Hết hạn',
        cvc: 'CVC',
        savePayment: 'Lưu thông tin thanh toán',
        paymentNote: 'Thông tin thanh toán mẫu chỉ dùng để kiểm tra frontend.',
        confirmation: 'Đã lưu thông tin thanh toán cho bản xem trước checkout.',
      },
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
      '5': {
        name: 'Blazer Sandline',
        category: 'Blazer',
        description: 'Vai gọn, phom đứng và độ rủ mềm từ linen pha viscose.',
      },
    },
    virtualTryOn: virtualTryOnMessages.vi,
  },
}
