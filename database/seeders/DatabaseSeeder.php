<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\City;
use App\Models\Role;
use App\Models\User;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\Coupon;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        $roles = [
            ['name' => 'Super Admin', 'slug' => 'super-admin'],
            ['name' => 'Admin', 'slug' => 'admin'],
            ['name' => 'Manager', 'slug' => 'manager'],
            ['name' => 'Customer', 'slug' => 'customer'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }

        $superAdminRole = Role::where('slug', 'super-admin')->first();
        $customerRole = Role::where('slug', 'customer')->first();

        // 2. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@luxury.com'],
            [
                'name' => 'Luxury Admin',
                'password' => Hash::make('password'),
                'role_id' => $superAdminRole->id,
                'phone' => '+212 600000001',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
            ]
        );

        $customer = User::firstOrCreate(
            ['email' => 'customer@luxury.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'role_id' => $customerRole->id,
                'phone' => '+212 600000002',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
                'loyalty_points' => 120,
            ]
        );

        // 3. Cities
        $citiesData = [
            ['name_en' => 'Casablanca', 'name_fr' => 'Casablanca', 'name_ar' => 'الدار البيضاء'],
            ['name_en' => 'Marrakech', 'name_fr' => 'Marrakech', 'name_ar' => 'مراكش'],
            ['name_en' => 'Rabat', 'name_fr' => 'Rabat', 'name_ar' => 'الرباط'],
            ['name_en' => 'Tangier', 'name_fr' => 'Tanger', 'name_ar' => 'طنجة'],
            ['name_en' => 'Agadir', 'name_fr' => 'Agadir', 'name_ar' => 'أكادير'],
            ['name_en' => 'Fes', 'name_fr' => 'Fès', 'name_ar' => 'فاس'],
        ];

        foreach ($citiesData as $c) {
            City::firstOrCreate(['name_en' => $c['name_en']], $c);
        }

        // 4. Categories
        $categoriesData = [
            ['name_en' => 'Hypercar', 'name_fr' => 'Hypercar', 'name_ar' => 'سيارة خارقة', 'slug' => 'hypercar', 'image' => 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=500'],
            ['name_en' => 'SUV', 'name_fr' => 'SUV', 'name_ar' => 'سيارة دفع رباعي', 'slug' => 'suv', 'image' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=500'],
            ['name_en' => 'Coupe', 'name_fr' => 'Coupé', 'name_ar' => 'كوبيه', 'slug' => 'coupe', 'image' => 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=500'],
            ['name_en' => 'Convertible', 'name_fr' => 'Cabriolet', 'name_ar' => 'مكشوفة', 'slug' => 'convertible', 'image' => 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=500'],
            ['name_en' => 'Sedan', 'name_fr' => 'Berline', 'name_ar' => 'سيدان', 'slug' => 'sedan', 'image' => 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=500'],
        ];

        foreach ($categoriesData as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 5. Brands
        $brandsData = [
            ['name' => 'Lamborghini', 'slug' => 'lamborghini', 'logo' => 'https://logos-world.net/wp-content/uploads/2021/03/Lamborghini-Logo.png'],
            ['name' => 'Porsche', 'slug' => 'porsche', 'logo' => 'https://logos-world.net/wp-content/uploads/2021/04/Porsche-Logo.png'],
            ['name' => 'BMW', 'slug' => 'bmw', 'logo' => 'https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png'],
            ['name' => 'Mercedes-Benz', 'slug' => 'mercedes-benz', 'logo' => 'https://logos-world.net/wp-content/uploads/2020/05/Mercedes-Benz-Logo.png'],
            ['name' => 'Audi', 'slug' => 'audi', 'logo' => 'https://logos-world.net/wp-content/uploads/2021/02/Audi-Logo.png'],
            ['name' => 'Ferrari', 'slug' => 'ferrari', 'logo' => 'https://logos-world.net/wp-content/uploads/2020/05/Ferrari-Logo.png'],
            ['name' => 'Bentley', 'slug' => 'bentley', 'logo' => 'https://logos-world.net/wp-content/uploads/2021/04/Bentley-Logo.png'],
        ];

        foreach ($brandsData as $b) {
            Brand::firstOrCreate(['slug' => $b['slug']], $b);
        }

        // 6. Cars & Car Images
        $carsData = [
            [
                'brand' => 'lamborghini',
                'category' => 'hypercar',
                'name' => 'Huracán Evo',
                'price_per_day' => 1200.00,
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'seats' => 2,
                'rating' => 4.9,
                'description_en' => 'Experience the absolute thrill of driving a Lamborghini Huracán Evo. With its roaring V10 engine, sharp design, and cutting-edge aerodynamics, it offers an adrenaline-fueled luxury drive.',
                'description_fr' => 'Découvrez le frisson absolu de conduire une Lamborghini Huracán Evo. Avec son moteur V10 rugissant, son design acéré et son aérodynamisme de pointe, elle offre une conduite de luxe alimentée en adrénaline.',
                'description_ar' => 'اختبر الإثارة المطلقة بقيادة لامبورغيني هوراكان إيفو. مع محركها V10 الهادر وتصميمها الحاد وديناميكيتها الهوائية المتطورة، تقدم لك قيادة فاخرة مفعمة بالأدرينالين.',
                'features' => ['Sport Mode', 'Carbon Ceramic Breaks', 'Launch Control', 'Apple CarPlay', 'Premium Sound System', 'Alcantara Interior'],
                'specifications' => [
                    'Horsepower' => '640 HP',
                    'Acceleration (0-100)' => '2.9 s',
                    'Top Speed' => '325 km/h',
                    'Engine' => '5.2L V10',
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=800',
                    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800'
                ]
            ],
            [
                'brand' => 'porsche',
                'category' => 'coupe',
                'name' => '911 Carrera S',
                'price_per_day' => 650.00,
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'seats' => 4,
                'rating' => 4.85,
                'description_en' => 'The Porsche 911 Carrera S represents the pinnacle of sports car engineering. It combines daily usability with sports car performance, making every drive memorable.',
                'description_fr' => 'La Porsche 911 Carrera S représente le summum de l\'ingénierie des voitures de sport. Elle allie utilisabilité quotidienne et performances sportives, rendant chaque trajet mémorable.',
                'description_ar' => 'تمثل بورشه 911 كاريرا إس قمة هندسة السيارات الرياضية. فهي تجمع بين الاستخدام اليومي والأداء الرياضي، مما يجعل كل رحلة لا تُنسى.',
                'features' => ['PASM Suspension', 'Adaptive Cruise Control', 'Heated Seats', 'BOSE Surround System', 'Sport Chrono Package', 'Sunroof'],
                'specifications' => [
                    'Horsepower' => '450 HP',
                    'Acceleration (0-100)' => '3.5 s',
                    'Top Speed' => '308 km/h',
                    'Engine' => '3.0L Twin-Turbo Flat-6',
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800',
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800'
                ]
            ],
            [
                'brand' => 'mercedes-benz',
                'category' => 'coupe',
                'name' => 'AMG GT Black Series',
                'price_per_day' => 1500.00,
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'seats' => 2,
                'rating' => 4.95,
                'description_en' => 'Uncompromising performance directly from the racetrack. The Mercedes-AMG GT Black Series is a engineering masterpiece featuring active aerodynamics and the most powerful V8 engine from AMG.',
                'description_fr' => 'Des performances sans compromis tout droit sorties de la piste de course. La Mercedes-AMG GT Black Series est un chef-d\'œuvre d\'ingénierie doté d\'un aérodynamisme actif et du moteur V8 le plus puissant d\'AMG.',
                'description_ar' => 'أداء لا مثيل له مستوحى مباشرة من حلبات السباق. مرسيدس AMG GT بلاك سيريز هي تحفة هندسية تتميز بديناميكا هوائية نشطة وأقوى محرك V8 من AMG.',
                'features' => ['AMG Traction Control', 'Carbon Fiber Wings', 'Track Package', 'Burmester Sound System', 'Performance Seats'],
                'specifications' => [
                    'Horsepower' => '730 HP',
                    'Acceleration (0-100)' => '3.2 s',
                    'Top Speed' => '325 km/h',
                    'Engine' => '4.0L Bi-Turbo V8',
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800',
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800'
                ]
            ],
            [
                'brand' => 'bmw',
                'category' => 'sedan',
                'name' => 'M5 Competition',
                'price_per_day' => 480.00,
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'seats' => 5,
                'rating' => 4.8,
                'description_en' => 'The ultimate executive express. The BMW M5 Competition combines the luxurious spacing of a 5-Series saloon with the jaw-dropping track speed of a supercar.',
                'description_fr' => 'L\'express exécutif ultime. La BMW M5 Competition combine l\'espace luxueux d\'une berline Série 5 avec la vitesse de piste époustouflante d\'une supercar.',
                'description_ar' => 'سيارة الصالون التنفيذية الفائقة. تجمع بي إم دبليو M5 كومبيتشن بين المساحة الفاخرة لسيارة الفئة الخامسة والسرعة المذهلة لسيارة خارقة على المضمار.',
                'features' => ['M xDrive AWD', 'Heated & Ventilated Seats', 'Heads-up Display', 'Gesture Control', 'Harman Kardon Audio'],
                'specifications' => [
                    'Horsepower' => '625 HP',
                    'Acceleration (0-100)' => '3.3 s',
                    'Top Speed' => '305 km/h',
                    'Engine' => '4.4L TwinPower Turbo V8',
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800',
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800'
                ]
            ],
            [
                'brand' => 'audi',
                'category' => 'hypercar',
                'name' => 'R8 V10 Decennium',
                'price_per_day' => 750.00,
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'seats' => 2,
                'rating' => 4.78,
                'description_en' => 'Celebrate a decade of the V10 engine with the Audi R8 V10 Decennium. Sleek matte bronze details, raw mid-engine V10 acceleration, and legendary Quattro AWD handle corners like nothing else.',
                'description_fr' => 'Célébrez une décennie de moteur V10 avec l\'Audi R8 V10 Decennium. Détails élégants en bronze mat, accélération V10 à moteur central et légendaire transmission intégrale Quattro pour des virages incomparables.',
                'description_ar' => 'احتفل بمرور عقد على محرك V10 مع أودي R8 V10 ديسينيوم. تفاصيل برونزية غير لامعة أنيقة، وتسارع V10 ذو المحرك الوسطي، ونظام الدفع الرباعي Quattro الأسطوري.',
                'features' => ['Quattro AWD', 'Matte Bronze Accents', 'Virtual Cockpit', 'Carbon Fiber Accents', 'Laser Headlights'],
                'specifications' => [
                    'Horsepower' => '620 HP',
                    'Acceleration (0-100)' => '3.1 s',
                    'Top Speed' => '331 km/h',
                    'Engine' => '5.2L V10 FSI',
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800',
                    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800'
                ]
            ],
            [
                'brand' => 'ferrari',
                'category' => 'convertible',
                'name' => 'F8 Spider',
                'price_per_day' => 1400.00,
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'seats' => 2,
                'rating' => 4.92,
                'description_en' => 'The Ferrari F8 Spider is the open-top benchmark for supercars. Enjoy the roar of the award-winning twin-turbo V8 with the wind in your hair and unmatched agility.',
                'description_fr' => 'La Ferrari F8 Spider est la référence en matière de supercars cabriolets. Profitez du rugissement du V8 bi-turbo primé avec le vent dans les cheveux et une agilité inégalée.',
                'description_ar' => 'تعتبر فيراري F8 سبايدر المرجع الأساسي للسيارات الخارقة ذات السقف المكشوف. استمتع بزئير محرك V8 ثنائي التيربو الحائز على جوائز مع الهواء في شعرك ورشاقة لا تضاهى.',
                'features' => ['Retractable Hard Top', 'Side Slip Angle Control', 'F1 Dual-Clutch Gearbox', 'Carbon Interior Pack', 'Passenger Display'],
                'specifications' => [
                    'Horsepower' => '720 HP',
                    'Acceleration (0-100)' => '2.9 s',
                    'Top Speed' => '340 km/h',
                    'Engine' => '3.9L Twin-Turbo V8',
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800',
                    'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800'
                ]
            ],
            [
                'brand' => 'porsche',
                'category' => 'suv',
                'name' => 'Cayenne Turbo GT',
                'price_per_day' => 550.00,
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'seats' => 5,
                'rating' => 4.88,
                'description_en' => 'The Cayenne Turbo GT is configured for maximum performance and handling. It holds racetrack records while providing maximum premium comfort for up to 5 occupants.',
                'description_fr' => 'Le Cayenne Turbo GT est configuré pour des performances et une maniabilité maximales. Il détient des records sur piste tout en offrant un confort premium maximal pour jusqu\'à 5 occupants.',
                'description_ar' => 'تم تكوين كايين توربو GT لتوفير أقصى قدر من الأداء والتحكم. إنها تحمل أرقاماً قياسية في حلبات السباق مع توفير أقصى درجات الراحة الفاخرة لما يصل إلى 5 ركاب.',
                'features' => ['Titanium Exhaust', 'Carbon Roof', 'Rear Axle Steering', 'Ceramic Brakes', 'Alcantara Sports Seats'],
                'specifications' => [
                    'Horsepower' => '640 HP',
                    'Acceleration (0-100)' => '3.3 s',
                    'Top Speed' => '300 km/h',
                    'Engine' => '4.0L Twin-Turbo V8',
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800',
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800'
                ]
            ],
        ];

        foreach ($carsData as $c) {
            $brand = Brand::where('slug', $c['brand'])->first();
            $category = Category::where('slug', $c['category'])->first();

            if ($brand && $category) {
                $car = Car::firstOrCreate(
                    ['slug' => Str::slug($brand->name . ' ' . $c['name'])],
                    [
                        'brand_id' => $brand->id,
                        'category_id' => $category->id,
                        'name' => $c['name'],
                        'price_per_day' => $c['price_per_day'],
                        'fuel_type' => $c['fuel_type'],
                        'transmission' => $c['transmission'],
                        'seats' => $c['seats'],
                        'rating' => $c['rating'],
                        'description_en' => $c['description_en'],
                        'description_fr' => $c['description_fr'],
                        'description_ar' => $c['description_ar'],
                        'features' => $c['features'],
                        'specifications' => $c['specifications'],
                        'is_available' => true,
                    ]
                );

                // Add Images
                foreach ($c['images'] as $index => $imgUrl) {
                    CarImage::firstOrCreate(
                        ['car_id' => $car->id, 'image_path' => $imgUrl],
                        [
                            'is_primary' => ($index === 0),
                        ]
                    );
                }

                // Add a sample review
                Review::firstOrCreate(
                    ['car_id' => $car->id, 'user_id' => $customer->id],
                    [
                        'rating' => rand(4, 5),
                        'comment' => 'Unbelievable driving experience! Highly recommended for any luxury car lover visiting Morocco.',
                    ]
                );
            }
        }

        // 7. Coupons
        Coupon::firstOrCreate(
            ['code' => 'LUXURY20'],
            [
                'discount_type' => 'percent',
                'discount_value' => 20.00,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(6),
                'active' => true,
            ]
        );

        // 8. Settings
        $settings = [
            ['key' => 'site_name', 'value' => 'Veloce Luxury Rentals'],
            ['key' => 'contact_email', 'value' => 'contact@veloce-luxury.com'],
            ['key' => 'contact_phone', 'value' => '+212 522 123 456'],
            ['key' => 'contact_address', 'value' => 'Boulevard d\'Anfa, Casablanca, Morocco'],
        ];

        foreach ($settings as $set) {
            Setting::firstOrCreate(['key' => $set['key']], $set);
        }
    }
}
