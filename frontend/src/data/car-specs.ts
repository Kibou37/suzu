export type CarSpecItem = {
  label: string;
  value: string;
};

export type CarSpecGroup = {
  title: string;
  items: CarSpecItem[];
};

/** Base model specs keyed by lineup slug (vitara, jimny, swift, s-cross). */
export const carSpecsByModel: Record<string, CarSpecGroup[]> = {
  vitara: [
    {
      title: 'Engine & performance',
      items: [
        { label: 'Engine', value: '1.4L Boosterjet turbo petrol' },
        { label: 'Power', value: '102 hp (75 kW) at 5,500 rpm' },
        { label: 'Torque', value: '140 Nm at 2,000–4,000 rpm' },
        { label: 'Drive', value: 'ALLGRIP selectable 4WD' },
        { label: '0–100 km/h', value: '10.2 s' },
        { label: 'Top speed', value: '190 km/h' },
        { label: 'Fuel consumption (WLTP combined)', value: '5.8 L/100 km' },
        { label: 'CO₂ emissions', value: '132 g/km' },
      ],
    },
    {
      title: 'Dimensions & capacity',
      items: [
        { label: 'Length × width × height', value: '4,175 × 1,775 × 1,610 mm' },
        { label: 'Wheelbase', value: '2,500 mm' },
        { label: 'Ground clearance', value: '180 mm' },
        { label: 'Boot volume', value: '375 L / 1,160 L (seats folded)' },
        { label: 'Fuel tank', value: '47 L' },
        { label: 'Kerb weight', value: '1,160–1,245 kg' },
        { label: 'Seating', value: '5' },
      ],
    },
    {
      title: 'Chassis & safety',
      items: [
        { label: 'Suspension', value: 'MacPherson strut front / torsion beam rear' },
        { label: 'Brakes', value: 'Ventilated disc front / disc rear' },
        { label: 'Safety systems', value: 'Dual SRS airbags, ABS with EBD, ESP®' },
        { label: 'Driver assistance', value: 'Lane departure warning, blind spot monitor (GLX)' },
      ],
    },
  ],
  jimny: [
    {
      title: 'Engine & performance',
      items: [
        { label: 'Engine', value: '1.5L K15B petrol' },
        { label: 'Power', value: '102 hp (75 kW) at 6,000 rpm' },
        { label: 'Torque', value: '130 Nm at 4,000 rpm' },
        { label: 'Drive', value: 'ALLGRIP PRO part-time 4WD with low range' },
        { label: 'Transfer case', value: '2-speed with 4L mode' },
        { label: 'Top speed', value: '145 km/h' },
        { label: 'Fuel consumption (WLTP combined)', value: '6.4 L/100 km' },
        { label: 'CO₂ emissions', value: '147 g/km' },
      ],
    },
    {
      title: 'Dimensions & capacity',
      items: [
        { label: 'Length × width × height', value: '3,645 × 1,645 × 1,720 mm' },
        { label: 'Wheelbase', value: '2,250 mm' },
        { label: 'Ground clearance', value: '210 mm' },
        { label: 'Approach / departure angle', value: '37° / 49°' },
        { label: 'Boot volume', value: '85 L / 830 L (seats folded)' },
        { label: 'Fuel tank', value: '40 L' },
        { label: 'Kerb weight', value: '1,090–1,135 kg' },
        { label: 'Seating', value: '4' },
      ],
    },
    {
      title: 'Chassis & safety',
      items: [
        { label: 'Chassis', value: 'Ladder-frame with rigid axles' },
        { label: 'Suspension', value: '3-link rigid axle front and rear' },
        { label: 'Brakes', value: 'Ventilated disc front / drum rear' },
        { label: 'Safety systems', value: 'Dual SRS airbags, ABS with EBD, ESP®' },
        { label: 'Off-road', value: 'Hill hold control, hill descent control' },
      ],
    },
  ],
  swift: [
    {
      title: 'Engine & performance',
      items: [
        { label: 'Engine', value: '1.2L Dualjet petrol' },
        { label: 'Power', value: '83 hp (61 kW) at 6,000 rpm' },
        { label: 'Torque', value: '112 Nm at 4,400 rpm' },
        { label: 'Drive', value: 'Front-wheel drive' },
        { label: '0–100 km/h', value: '12.4 s' },
        { label: 'Top speed', value: '165 km/h' },
        { label: 'Fuel consumption (WLTP combined)', value: '5.1 L/100 km' },
        { label: 'CO₂ emissions', value: '117 g/km' },
      ],
    },
    {
      title: 'Dimensions & capacity',
      items: [
        { label: 'Length × width × height', value: '3,860 × 1,735 × 1,495 mm' },
        { label: 'Wheelbase', value: '2,450 mm' },
        { label: 'Ground clearance', value: '120 mm' },
        { label: 'Boot volume', value: '265 L / 589 L (seats folded)' },
        { label: 'Fuel tank', value: '37 L' },
        { label: 'Kerb weight', value: '890–935 kg' },
        { label: 'Seating', value: '5' },
      ],
    },
    {
      title: 'Chassis & safety',
      items: [
        { label: 'Suspension', value: 'MacPherson strut front / torsion beam rear' },
        { label: 'Brakes', value: 'Ventilated disc front / drum rear' },
        { label: 'Safety systems', value: 'Dual SRS airbags, ABS with EBD, ESP®' },
        { label: 'Driver assistance', value: 'Adaptive cruise control (Comfort+)' },
      ],
    },
  ],
  's-cross': [
    {
      title: 'Engine & performance',
      items: [
        { label: 'Engine', value: '1.5L Dualjet + electric motor (Mild Hybrid)' },
        { label: 'System power', value: '115 hp (85 kW)' },
        { label: 'Torque', value: '138 Nm' },
        { label: 'Drive', value: 'ALLGRIP selectable 4WD' },
        { label: '0–100 km/h', value: '12.0 s' },
        { label: 'Top speed', value: '180 km/h' },
        { label: 'Fuel consumption (WLTP combined)', value: '5.4 L/100 km' },
        { label: 'CO₂ emissions', value: '122 g/km' },
      ],
    },
    {
      title: 'Dimensions & capacity',
      items: [
        { label: 'Length × width × height', value: '4,300 × 1,785 × 1,585 mm' },
        { label: 'Wheelbase', value: '2,600 mm' },
        { label: 'Ground clearance', value: '175 mm' },
        { label: 'Boot volume', value: '430 L / 1,269 L (seats folded)' },
        { label: 'Fuel tank', value: '47 L' },
        { label: 'Kerb weight', value: '1,195–1,280 kg' },
        { label: 'Seating', value: '5' },
      ],
    },
    {
      title: 'Chassis & safety',
      items: [
        { label: 'Suspension', value: 'MacPherson strut front / torsion beam rear' },
        { label: 'Brakes', value: 'Ventilated disc front / disc rear' },
        { label: 'Safety systems', value: '6 SRS airbags, ABS with EBD, ESP®' },
        { label: 'Driver assistance', value: 'Adaptive cruise, rear cross traffic alert (Premium)' },
      ],
    },
  ],
};
