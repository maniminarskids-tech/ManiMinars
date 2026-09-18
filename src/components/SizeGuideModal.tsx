import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  ageGroup: 'kids' | 'juniors';
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, ageGroup }) => {
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [activeTab, setActiveTab] = useState<'kids' | 'juniors'>(ageGroup);

  if (!isOpen) return null;

  const kidsData = [
    { size: '1-2Y', heightCm: '86–92', heightIn: '34–36', chestCm: '51–53', chestIn: '20–21', waistCm: '50–51', waistIn: '19.5–20' },
    { size: '3-4Y', heightCm: '98–104', heightIn: '38–41', chestCm: '55–57', chestIn: '21.5–22.5', waistCm: '52–54', waistIn: '20.5–21' },
    { size: '5-6Y', heightCm: '110–116', heightIn: '43–45.5', chestCm: '59–61', chestIn: '23–24', waistCm: '55–57', waistIn: '21.5–22.5' },
    { size: '7-8Y', heightCm: '122–128', heightIn: '48–50', chestCm: '63–67', chestIn: '25–26.5', waistCm: '58–60', waistIn: '23–23.5' },
    { size: '9-10Y', heightCm: '134–140', heightIn: '53–55', chestCm: '69–73', chestIn: '27–28.5', waistCm: '61–64', waistIn: '24–25' },
  ];

  const juniorsData = [
    { size: '11-12Y', heightCm: '146–152', heightIn: '57–60', chestCm: '75–79', chestIn: '29.5–31', waistCm: '65–68', waistIn: '25.5–26.5' },
    { size: '13-14Y', heightCm: '158–164', heightIn: '62–64.5', chestCm: '81–86', chestIn: '32–34', waistCm: '69–72', waistIn: '27–28.5' },
    { size: '15-16Y', heightCm: '170–176', heightIn: '67–69', chestCm: '88–94', chestIn: '34.5–37', waistCm: '73–77', waistIn: '28.5–30.5' },
  ];

  const currentRows = activeTab === 'kids' ? kidsData : juniorsData;

  return (
    <div
      id="size-guide-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="size-guide-modal-content"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#E84D3D]" />
              <h3 className="font-logo font-bold text-lg text-neutral-900">
                Children’s Sizing Guide
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Age Tab & Unit Switcher */}
          <div className="flex items-center justify-between mt-4 mb-4 gap-2">
            <div className="flex rounded-xl bg-neutral-100 p-1">
              <button
                onClick={() => setActiveTab('kids')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'kids'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Little Loom Kids (0–10Y)
              </button>
              <button
                onClick={() => setActiveTab('juniors')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'juniors'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Little Loom Juniors (11–16Y)
              </button>
            </div>

            <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-bold">
              <button
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  unit === 'cm'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                CM
              </button>
              <button
                onClick={() => setUnit('inches')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  unit === 'inches'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                IN
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Height ({unit})</th>
                  <th className="py-2.5 px-3">Chest ({unit})</th>
                  <th className="py-2.5 px-3">Waist ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {currentRows.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 px-3 font-bold text-neutral-900">{row.size}</td>
                    <td className="py-2.5 px-3">
                      {unit === 'cm' ? row.heightCm : row.heightIn}
                    </td>
                    <td className="py-2.5 px-3">
                      {unit === 'cm' ? row.chestCm : row.chestIn}
                    </td>
                    <td className="py-2.5 px-3">
                      {unit === 'cm' ? row.waistCm : row.waistIn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 text-[11px] text-amber-900">
            <strong>Parent Tip:</strong> If your child is between sizes or in the middle of a growth spurt, we recommend ordering one size up for longer wear.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
