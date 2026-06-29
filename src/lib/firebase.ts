import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  limit, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtr2Hg0CiXWRzzbGDM-qO3drw84IvY3dI",
  authDomain: "gen-lang-client-0520910005.firebaseapp.com",
  projectId: "gen-lang-client-0520910005",
  storageBucket: "gen-lang-client-0520910005.firebasestorage.app",
  messagingSenderId: "691047005619",
  appId: "1:691047005619:web:243077bd951dd563f85fc6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Collection helpers
export const collections = {
  products: collection(db, 'products'),
  customers: collection(db, 'customers'),
  suppliers: collection(db, 'suppliers'),
  invoices: collection(db, 'invoices'),
  purchases: collection(db, 'purchases'),
  jobCards: collection(db, 'jobCards'),
  notifications: collection(db, 'notifications'),
  profiles: collection(db, 'profiles')
};

// Seed sample data helper
export async function seedInitialDataIfEmpty() {
  try {
    const pSnap = await getDocs(query(collections.products, limit(1)));
    if (pSnap.empty) {
      console.log("Seeding beautiful initial sample data to Firestore...");
      
      // Sample Products
      const sampleProducts = [
        {
          name: "Bosch Spark Plug Super 4",
          category: "Electricals",
          brand: "Bosch",
          vehicleModel: "Maruti Swift / Dzire",
          partNumber: "BOS-SP-4432",
          barcode: "8901032120012",
          qrCode: "BOS-SP-4432-SWIFT",
          purchasePrice: 180,
          sellingPrice: 350,
          gstPercent: 18,
          stockQuantity: 45,
          lowStockWarning: 10,
          imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Castrol Magnatec 5W-30 (4L)",
          category: "Lubricants",
          brand: "Castrol",
          vehicleModel: "Universal Diesel/Petrol",
          partNumber: "CAS-MAG-5W30-4L",
          barcode: "5011987241289",
          qrCode: "CAS-MAG-Universal",
          purchasePrice: 1650,
          sellingPrice: 2400,
          gstPercent: 18,
          stockQuantity: 8,
          lowStockWarning: 15, // Will trigger warning
          imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Brembo Front Brake Pads Set",
          category: "Brakes",
          brand: "Brembo",
          vehicleModel: "Hyundai i20 Elite",
          partNumber: "BRE-BP-HY092",
          barcode: "8020584013426",
          qrCode: "BRE-BP-I20",
          purchasePrice: 1200,
          sellingPrice: 1950,
          gstPercent: 18,
          stockQuantity: 22,
          lowStockWarning: 5,
          imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Exide Mile Max Battery (35Ah)",
          category: "Batteries",
          brand: "Exide",
          vehicleModel: "Hyundai i10 / Grand",
          partNumber: "EXI-MM-35L",
          barcode: "8902542100234",
          qrCode: "EXI-MM-35L-I10",
          purchasePrice: 2800,
          sellingPrice: 4200,
          gstPercent: 28,
          stockQuantity: 4,
          lowStockWarning: 5, // Will trigger warning
          imageUrl: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Lumax Headlight Assembly Right",
          category: "Body Parts",
          brand: "Lumax",
          vehicleModel: "Honda City 2018",
          partNumber: "LUM-HL-HC18-R",
          barcode: "8904531230114",
          qrCode: "LUM-HC18-R",
          purchasePrice: 3200,
          sellingPrice: 4800,
          gstPercent: 18,
          stockQuantity: 2,
          lowStockWarning: 3, // Will trigger warning
          imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=300&q=80"
        }
      ];

      for (const p of sampleProducts) {
        await addDoc(collections.products, p);
      }

      // Sample Customers
      const sampleCustomers = [
        {
          name: "Amit Sharma",
          phone: "9876543210",
          email: "amit.sharma@gmail.com",
          creditBalance: 0,
          vehicles: [
            { model: "Maruti Swift VXI", registrationNumber: "DL 3C AM 1234", year: "2019" }
          ],
          createdAt: new Date().toISOString()
        },
        {
          name: "Rahul Verma",
          phone: "9123456789",
          email: "rahul.v@yahoo.com",
          creditBalance: 1250, // Credit balance
          vehicles: [
            { model: "Hyundai i20 Asta", registrationNumber: "HR 26 CP 5678", year: "2018" },
            { model: "Honda Activa 5G", registrationNumber: "HR 26 DQ 9988", year: "2020" }
          ],
          createdAt: new Date().toISOString()
        },
        {
          name: "Priya Patel",
          phone: "9988776655",
          email: "priya.patel@outlook.com",
          creditBalance: 0,
          vehicles: [
            { model: "Honda City ZX", registrationNumber: "MH 02 CB 4321", year: "2017" }
          ],
          createdAt: new Date().toISOString()
        }
      ];

      for (const c of sampleCustomers) {
        await addDoc(collections.customers, c);
      }

      // Sample Suppliers
      const sampleSuppliers = [
        {
          name: "National Auto Distributors",
          phone: "9811223344",
          email: "sales@nationalauto.com",
          companyName: "National Auto Spares Ltd",
          gstin: "07AAAAA1111A1Z1",
          pendingPayment: 45000,
          createdAt: new Date().toISOString()
        },
        {
          name: "Elite Lubricants Supplier",
          phone: "9822334455",
          email: "orders@elitelubes.com",
          companyName: "Elite Oil & Filters",
          gstin: "07BBBBB2222B2Z2",
          pendingPayment: 0,
          createdAt: new Date().toISOString()
        }
      ];

      for (const s of sampleSuppliers) {
        await addDoc(collections.suppliers, s);
      }

      // Sample Invoices
      const sampleInvoices = [
        {
          invoiceNumber: "INV-2026-001",
          customerId: "temp_cust_1",
          customerName: "Amit Sharma",
          customerPhone: "9876543210",
          items: [
            {
              productId: "temp_prod_1",
              name: "Bosch Spark Plug Super 4",
              partNumber: "BOS-SP-4432",
              quantity: 4,
              sellingPrice: 350,
              gstPercent: 18,
              gstAmount: 213.56,
              subtotal: 1400
            }
          ],
          totalBeforeGst: 1186.44,
          totalGst: 213.56,
          discount: 0,
          grandTotal: 1400,
          paymentMethod: "UPI",
          status: "Paid",
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString() // 2 days ago
        },
        {
          invoiceNumber: "INV-2026-002",
          customerId: "temp_cust_2",
          customerName: "Rahul Verma",
          customerPhone: "9123456789",
          items: [
            {
              productId: "temp_prod_2",
              name: "Castrol Magnatec 5W-30 (4L)",
              partNumber: "CAS-MAG-5W30-4L",
              quantity: 1,
              sellingPrice: 2400,
              gstPercent: 18,
              gstAmount: 366.10,
              subtotal: 2400
            }
          ],
          totalBeforeGst: 2033.90,
          totalGst: 366.10,
          discount: 100,
          grandTotal: 2300,
          paymentMethod: "Cash",
          status: "Paid",
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() // 1 day ago
        }
      ];

      for (const inv of sampleInvoices) {
        await addDoc(collections.invoices, inv);
      }

      // Sample Purchases
      const samplePurchases = [
        {
          billNumber: "PUR-2026-001",
          supplierId: "temp_sup_1",
          supplierName: "National Auto Distributors",
          items: [
            {
              productId: "temp_prod_3",
              name: "Brembo Front Brake Pads Set",
              quantity: 10,
              purchasePrice: 1200,
              subtotal: 12000
            }
          ],
          grandTotal: 12000,
          paymentStatus: "Paid",
          createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
        }
      ];

      for (const pur of samplePurchases) {
        await addDoc(collections.purchases, pur);
      }

      // Sample Job Cards
      const sampleJobCards = [
        {
          jobCardNumber: "JC-2026-001",
          customerId: "temp_cust_1",
          customerName: "Amit Sharma",
          customerPhone: "9876543210",
          vehicleModel: "Maruti Swift VXI",
          vehiclePlate: "DL 3C AM 1234",
          complaints: ["Engine noise during acceleration", "Front brake pads making sound"],
          assignedMechanic: "Ramesh Kumar",
          status: "In Progress",
          estimatedCost: 3500,
          notes: "Customer reported issue started last week. Spark plugs and brakes need inspection.",
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
        },
        {
          jobCardNumber: "JC-2026-002",
          customerId: "temp_cust_3",
          customerName: "Priya Patel",
          customerPhone: "9988776655",
          vehicleModel: "Honda City ZX",
          vehiclePlate: "MH 02 CB 4321",
          complaints: ["Periodic service 40,000 km", "AC cooling insufficient"],
          assignedMechanic: "Suresh Singh",
          status: "Ready",
          estimatedCost: 6500,
          actualCost: 6200,
          notes: "Service completed. Cabin filter changed, AC gas topped up.",
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        }
      ];

      for (const jc of sampleJobCards) {
        await addDoc(collections.jobCards, jc);
      }

      // Sample Notifications
      const sampleNotifications = [
        {
          title: "Low Stock Warning",
          message: "Castrol Magnatec 5W-30 (4L) is below warning level. Only 8 left.",
          type: "low_stock",
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          title: "Low Stock Warning",
          message: "Exide Mile Max Battery (35Ah) is below warning level. Only 4 left.",
          type: "low_stock",
          read: false,
          createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
        },
        {
          title: "Pending Service Job Card",
          message: "Job Card JC-2026-001 has been set to In Progress.",
          type: "service_due",
          read: true,
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
        }
      ];

      for (const n of sampleNotifications) {
        await addDoc(collections.notifications, n);
      }
    }
  } catch (err) {
    console.error("Error seeding initial data: ", err);
  }
}
