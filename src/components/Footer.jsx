export default function Footer() {
  return (
    <footer className="bg-white  mt-16">
      <div className="max-w mx-auto px-6 py-4 text-center text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600">
        © {new Date().getFullYear()} BillSplit+ · Smart Expense Settlement System
      </div>
    </footer>
  );
}
