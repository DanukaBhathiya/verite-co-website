// Product Management Guide:
// - To ADD a new product: Copy a product object and add it to the array
// - To REMOVE a product: Delete the entire product object or comment it out
// - To mark OUT OF STOCK: Set inStock: false
// - To mark as NEW ARRIVAL: Set isNew: true
// - To HIDE a product: Set active: false

export const mensProducts = [
  { 
    img: '/images/mens-denim-shorts.jpg', 
    title: "Men's Denim Shorts",
    description: "Stay cool. Stay stylish. Our latest men's denim shorts are perfect for everyday wear comfortable fit, premium denim, and modern detailing.",
    sizes: "28 to 36",
    price: "Light Blue Rs. 1790.00 | Dark Blue Rs. 1890.00",
    inStock: true,
    isNew: true,
    active: true
  },
  { 
    img: '/images/sarongs - men.jpg', 
    title: 'Premium Traditional Sarongs',
    description: "Premium quality traditional sarongs now available in beautiful colors: Black with Mustard Yellow, Black with White, Bright Green, Brown. Comfortable fabric with eye catching border designs. Perfect for Avurudu celebrations.",
    price: "Rs. 1290.00",
    inStock: true,
    isNew: false,
    active: true
  }
];

export const ladiesProducts = [
  { 
    img: '/images/ladies long floral skirt - ladies.jpg', 
    title: 'Long Floral Skirt',
    description: "Flowy, feminine, and effortlessly elegant. Our long floral skirt is designed to give you that graceful look while keeping you comfortable all day. Perfect for brunch dates, casual outings, or special moments.",
    price: "Rs. 1590.00",
    inStock: true,
    isNew: false,
    active: true
  },
  { 
    img: '/images/ladies pants - ladies.jpg', 
    title: 'Wide Leg Pants',
    description: "Effortless style meets all day comfort. Our wide leg pants are designed with a soft, flowy fabric and a comfortable elastic waist for the perfect fit. Available in: Navy Blue, Mustard Yellow, Maroon, Black, Green.",
    price: "Rs. 750.00",
    inStock: true,
    isNew: true,
    active: true
  }
];
