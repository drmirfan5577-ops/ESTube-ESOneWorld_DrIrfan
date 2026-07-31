export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white p-6 text-center text-sm border-t-2 border-red-600">
      <h3 className="text-xl font-bold text-red-500 mb-2">ESTube</h3>
      <p className="text-gray-400 mb-4">A project of ESOneWorld | Part of esmail.com Ecosystem</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300 mb-4">
        <p>⚠️ Warnings# | Secrecy policy# | Disclaimer#</p>
        <p>© Copyright: SMART WORLD ORDER</p>
        <p>Vision by Dr M Irfan Qadir Thaheem</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-4 text-blue-400 font-semibold">
        <span> WhatsApp: 0300_4737757</span>
        <span>✉️ dr.mirfan5577@gmail.com</span>
        <a href="https://drmirfan5577-ops.github.io/SmartWorldOrder" className="hover:underline"> SmartWorldOrder</a>
      </div>
      <p className="mt-4 text-gray-500 italic">"اس دنیا میں کچھ بھی ناممکن نہیں، بس منزل کے مطابق ضروریات پوری کرنی ہوتی ہیں"</p>
    </footer>
  );
}