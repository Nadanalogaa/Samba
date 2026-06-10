const pool = require('./pool');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    // Districts
    await pool.query(`
      INSERT INTO districts (code, name, address_line1, address_line2, phone) VALUES
        ('CHE', 'Chennai', '152, Peters Road, Chennai-600 086', 'Tamil Nadu', '044-28345678'),
        ('CBE', 'Coimbatore', '15, DB Road, RS Puram, Coimbatore-641002', 'Tamil Nadu', '0422-2541234')
      ON CONFLICT (code) DO NOTHING
    `);

    // Discount configuration
    await pool.query(`
      INSERT INTO discount_config (type_code, type_name, discount_percent, description) VALUES
        ('A', 'Premium', 25.00, 'Premium customers - 25% discount'),
        ('B', 'Standard', 20.00, 'Standard bulk customers - 20% discount'),
        ('C', 'Regular', 15.00, 'Regular customers - 15% discount'),
        ('D', 'Walk-in', 0.00, 'Walk-in customers - No discount')
      ON CONFLICT (type_code) DO NOTHING
    `);

    // Users
    const chePass = await bcrypt.hash('che123', 10);
    const cbePass = await bcrypt.hash('cbe123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO cash_users (username, password_hash, full_name, email, phone, districts, role) VALUES
        ('che_admin', $1, 'Chennai Admin', 'che@samba.com', '9876543001', '{CHE}', 'admin'),
        ('cbe_admin', $2, 'Coimbatore Admin', 'cbe@samba.com', '9876543002', '{CBE}', 'admin'),
        ('super_admin', $3, 'Super Admin', 'admin@samba.com', '9876543000', '{CHE,CBE}', 'admin'),
        ('che_op1', $1, 'Chennai Operator 1', 'cheop1@samba.com', '9876543003', '{CHE}', 'operator'),
        ('cbe_op1', $2, 'CBE Operator 1', 'cbeop1@samba.com', '9876543004', '{CBE}', 'operator')
      ON CONFLICT (username) DO NOTHING
    `, [chePass, cbePass, adminPass]);

    // Bill sequences
    await pool.query(`
      INSERT INTO bill_sequences (district_code, last_bill_no, last_proforma_no) VALUES
        ('CHE', 0, 0),
        ('CBE', 0, 0)
      ON CONFLICT (district_code) DO NOTHING
    `);

    // Sample Rate Master entries
    const books = [
      ['LABC', 'LKG', 'Little ABC Picture Book', 'L-ABC-PIC', 60.00],
      ['NPENLKG1', 'LKG', 'New Pencil LKG Term 1', 'NPENLKG-T1', 85.00],
      ['NPENLKG2', 'LKG', 'New Pencil LKG Term 2', 'NPENLKG-T2', 85.00],
      ['NPENLKG3', 'LKG', 'New Pencil LKG Term 3', 'NPENLKG-T3', 95.00],
      ['KGPEN1', 'UKG', 'KG Pencil Activity Term 1', 'KGPENACT-T1', 55.00],
      ['KGPEN2', 'UKG', 'KG Pencil Activity Term 2', 'KGPENACT-T2', 55.00],
      ['KGPEN3', 'UKG', 'KG Pencil Activity Term 3', 'KGPENACTL3', 60.00],
      ['NPENUKG1', 'UKG', 'New Pencil UKG Term 1', 'NPENUKG-T1', 90.00],
      ['NPENUKG2', 'UKG', 'New Pencil UKG Term 2', 'NPENUKG-T2', 90.00],
      ['NPENUKG3', 'UKG', 'New Pencil UKG Term 3', 'NPENUKG-T3', 100.00],
      ['LPENACU3', 'UKG', 'Little Pencil Activity UKG T3', 'L-PENACTU3', 60.00],
      ['TAM1T1', '1st', 'Tamil Term 1 - 1st Std', 'TAM-1-T1', 120.00],
      ['ENG1T1', '1st', 'English Term 1 - 1st Std', 'ENG-1-T1', 110.00],
      ['MAT1T1', '1st', 'Mathematics Term 1 - 1st Std', 'MAT-1-T1', 115.00],
      ['SCI1T1', '1st', 'Science Term 1 - 1st Std', 'SCI-1-T1', 105.00],
      ['TAM2T1', '2nd', 'Tamil Term 1 - 2nd Std', 'TAM-2-T1', 125.00],
      ['ENG2T1', '2nd', 'English Term 1 - 2nd Std', 'ENG-2-T1', 115.00],
      ['MAT2T1', '2nd', 'Mathematics Term 1 - 2nd Std', 'MAT-2-T1', 120.00],
      ['TAM3T1', '3rd', 'Tamil Term 1 - 3rd Std', 'TAM-3-T1', 130.00],
      ['ENG3T1', '3rd', 'English Term 1 - 3rd Std', 'ENG-3-T1', 120.00],
      ['TAM5T1', '5th', 'Tamil Term 1 - 5th Std', 'TAM-5-T1', 150.00],
      ['ENG5T1', '5th', 'English Term 1 - 5th Std', 'ENG-5-T1', 140.00],
      ['MAT5T1', '5th', 'Mathematics Term 1 - 5th Std', 'MAT-5-T1', 145.00],
      ['TAM10T1', '10th', 'Tamil Term 1 - 10th Std', 'TAM-10-T1', 220.00],
      ['ENG10T1', '10th', 'English Term 1 - 10th Std', 'ENG-10-T1', 210.00],
      ['MAT10T1', '10th', 'Mathematics Term 1 - 10th Std', 'MAT-10-T1', 230.00],
      ['SCI10T1', '10th', 'Science Term 1 - 10th Std', 'SCI-10-T1', 225.00],
      ['SOC10T1', '10th', 'Social Science Term 1 - 10th', 'SOC-10-T1', 200.00],
    ];

    for (const [code, std, title, short, rate] of books) {
      await pool.query(
        `INSERT INTO rate_master (book_code, standard, title_name, short_title, rate, created_by)
         VALUES ($1, $2, $3, $4, $5, 1) ON CONFLICT (book_code) DO NOTHING`,
        [code, std, title, short, rate]
      );
    }

    // Sample customers
    const customers = [
      ['C0001', 'ABC Matriculation School', '12 Anna Nagar', 'Chennai', '', '', '600040', 'A', 'Mr. Raghavan', '9876501001', 'CHE'],
      ['C0002', 'Government Primary School', '45 T Nagar', 'Chennai', '', '', '600017', 'B', 'Mrs. Lakshmi', '9876501002', 'CHE'],
      ['C0003', 'DAV Public School', '78 Adyar', 'Chennai', '', '', '600020', 'A', 'Mr. Suresh', '9876501003', 'CHE'],
      ['C0004', 'Sacred Heart School', '23 RS Puram', 'Coimbatore', '', '', '641002', 'B', 'Fr. Joseph', '9876501004', 'CBE'],
      ['C0005', 'GRD School', '56 Race Course', 'Coimbatore', '', '', '641018', 'C', 'Mrs. Anitha', '9876501005', 'CBE'],
      ['C0006', 'Walk-in Customer', '', '', '', '', '', 'D', '', '', 'CHE'],
      ['C0007', 'Walk-in Customer', '', '', '', '', '', 'D', '', '', 'CBE'],
    ];

    for (const [code, name, a1, a2, a3, a4, pin, type, contact, phone, dist] of customers) {
      await pool.query(
        `INSERT INTO customer_master (customer_code, customer_name, address1, address2, address3, address4, pin_code, customer_type, contact_person, phone, district_code, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,1) ON CONFLICT (customer_code) DO NOTHING`,
        [code, name, a1, a2, a3, a4, pin, type, contact, phone, dist]
      );
    }

    console.log('Seed data inserted successfully');
    console.log('');
    console.log('Default users:');
    console.log('  che_admin / che123     (Chennai only)');
    console.log('  cbe_admin / cbe123     (Coimbatore only)');
    console.log('  super_admin / admin123 (Both districts)');
    console.log('  che_op1 / che123       (Chennai operator)');
    console.log('  cbe_op1 / cbe123       (CBE operator)');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
