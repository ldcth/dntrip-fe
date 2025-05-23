import { useState } from "react";
import Head from "next/head";
import PracticalityCard from "@/components/PracticalityCard";
import InfoModal from "@/components/InfoModal";
import {
  CalendarIcon,
  CurrencyIcon,
  PowerIcon,
  TaxiIcon,
  PhoneIcon,
  InternetIcon,
  HospitalIcon,
  FlagIcon,
} from "@/assets/icons";
import Header from "@/components/Header";

export default function Home() {
  const [selectedInfo, setSelectedInfo] = useState<{
    id: string;
    title: string;
    icon: string;
    shortDescription: string;
    fullDescription: string;
  } | null>(null);

  const practicalityData = [
    {
      id: "currency",
      title: "CURRENCY",
      icon: CurrencyIcon,
      shortDescription:
        "Vietnam's unit of currency is the Vietnamese đồng (VND), represented by the '₫' symbol. You can find ...",
      fullDescription:
        "Vietnam's unit of currency is the <strong>Vietnamese đồng (VND)</strong>, represented by the '₫' symbol. You can find notes in denominations of 200₫, 500₫, 1,000₫, 2,000₫, 5,000₫, 10,000₫, 20,000₫, 50,000₫, 100,000₫, 200,000₫, and 500,000₫. For newcomers it can be helpful to ignore the final three zeros until you get the hang of the conversion.\n\n Cash is generally used for small purchases, however, most establishments will accept payments from major credit card providers such as Visa. In addition, hotels, tour operators, boutiques, restaurants, and grocery stores generally accept international debit and credit cards.\n\nIf you need to change money, currency exchange counters are available at airports, banks, and official exchange centers. However do note it can be very difficult to purchase dollars once you’re in Vietnam. For most travellers we recommend using ATMs instead of currency exchange points. ATMs are widely available across the country.",
    },
    {
      id: "taxi",
      title: "TAXI SERVICES",
      icon: TaxiIcon,
      shortDescription:
        "Vietnam has modern, efficient taxi services to help you get around. To avoid scams and haggling, we ...",
      fullDescription:
        "Vietnam has modern, efficient taxi services to help you get around. To avoid scams and haggling, we recommend using reputable companies like Vinasun or Mai Linh, or ride-hailing apps like Grab. Always ensure the meter is running or agree on a price before starting your journey. \n\n In major cities, motorbike taxis (xe ôm) are also available for short distances, but always negotiate the fare beforehand.",
    },
    {
      id: "holidays",
      title: "PUBLIC HOLIDAYS",
      icon: CalendarIcon,
      shortDescription:
        "Vietnamese Lunar New Year Festival (Tet) is the biggest holiday of the year, and takes place in ...",
      fullDescription:
        "Vietnamese Lunar New Year Festival (Tet) is the biggest holiday of the year, and takes place in late January or early February. Travellers should be aware that most businesses and restaurants shut down during this holiday, as Vietnamese travel home to be with their families. Public transport hubs are full to overflowing in the days leading up to Tet. Any transportation booked over the Tet period should be confirmed well in advance. \n\n Government agencies work eight hours a day from 8am to 5pm, with a one-hour lunch break. Working days are from Monday to Friday. \n\n Most banks in Vietnam open from 7:30am or 8am to 4:30pm, with a break for lunch. Some banks are open on Saturday mornings from 8am to 11:30pm.",
    },
    {
      id: "power",
      title: "POWER PLUGS",
      icon: PowerIcon,
      shortDescription:
        "The voltage supply in Vietnam is 220 volts. Most sockets accommodate plugs with two round prongs ...",
      fullDescription:
        "The voltage supply in Vietnam is 220 volts. Most sockets accommodate plugs with two round prongs. If you need adaptors you can find them at any electrical shop, or ask your hotel for assistance. Power cuts and surges are not common but can happen from time to time depending on the location.",
    },
    {
      id: "sim",
      title: "SIM CARDS & HELPFUL NUMBERS",
      icon: PhoneIcon,
      shortDescription:
        "Getting a local SIM card in Vietnam is fast and inexpensive. There are three major GSM network ...",
      fullDescription:
        "Getting a local SIM card in Vietnam is fast and inexpensive. There are three major GSM network providers: Viettel, Vinaphone, and Mobifone. \n\n You can buy prepaid SIM cards on arrival at major airports, as well as from countless shops across the country. You will need to show your passport to register your SIM card. Prices for SIM cards, SMS messages and phone calls are extremely affordable within Vietnam. You can load your phone credit in increments from 20,000 VND to 100,000 VND on most networks. Data-only SIM cards may cost 100,000 VND to 200,000 VND depending on the amount of data purchased. \n\n Emergency numbers: Police (113), Fire (114), Ambulance (115). Tourist police in major cities can provide assistance in English.",
    },
    {
      id: "internet",
      title: "INTERNET AND POSTAL SERVICES",
      icon: InternetIcon,
      shortDescription:
        "Vietnam is well-wired and in most destinations you can easily find a connection in cafes, spas ...",
      fullDescription:
        "Vietnam is well-wired and in most destinations you can easily find a connection in cafes, spas, shops, hotels and restaurants. Free public Internet access is available in several tourist hubs and major airports. Local 3G and 4G packages are an affordable option if you plan to visit remote areas or need to be online frequently.\n\nThe Vietnamese postal service is generally reliable, although packages can take longer to arrive than expected and are often held at the post office for pick-up. Mailboxes are uncommon. If you are sending postcards home, give them to your hotel to mail or send them directly from a post office.",
    },
    {
      id: "hospitals",
      title: "HOSPITALS",
      icon: HospitalIcon,
      shortDescription:
        "Vietnam's major cities have excellent clinics and hospitals ready to serve travellers, with E ...",
      fullDescription:
        "Vietnam's major cities have excellent clinics and hospitals ready to serve travellers, with English-speaking staff available at international facilities. In Hanoi and Ho Chi Minh City, international hospitals provide high-quality care but can be expensive. It's strongly recommended to have comprehensive travel insurance that covers medical evacuation. Pharmacies are plentiful and many medications are available without prescription, though quality can vary.",
    },
    {
      id: "embassies",
      title: "EMBASSIES AND CONSULATES",
      icon: FlagIcon,
      shortDescription:
        "Embassies and consulates of foreign countries in Vietnam can be found in the cities of Hanoi and Ho ...",
      fullDescription:
        "Embassies and consulates of foreign countries in Vietnam can be found in the cities of Hanoi and Ho Chi Minh City. Most embassies are located in the capital, Hanoi, while many countries maintain consulates in Ho Chi Minh City. In case of emergency, lost passport, or other consular services, contact your country's diplomatic mission. It's advisable to register with your embassy upon arrival for updates on safety and security.",
    },
  ];

  const handleCardClick = (info: {
    id: string;
    title: string;
    icon: string;
    shortDescription: string;
    fullDescription: string;
  }) => {
    setSelectedInfo(info);
  };

  const handleCloseModal = () => {
    setSelectedInfo(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Vietnam Travel Practicalities</title>
        <meta
          name="description"
          content="Essential information for your visit to Vietnam"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-600 mb-2">
            PRACTICALITIES
          </h1>
          <p className="text-xl text-gray-700">Get ready for your visit</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {practicalityData.map((item) => (
            <PracticalityCard
              key={item.id}
              title={item.title}
              icon={item.icon as unknown as string}
              description={item.shortDescription}
              onClick={() =>
                handleCardClick(
                  item as unknown as {
                    id: string;
                    title: string;
                    icon: string;
                    shortDescription: string;
                    fullDescription: string;
                  }
                )
              }
            />
          ))}
        </div>
      </main>

      {selectedInfo && (
        <InfoModal
          title={selectedInfo.title}
          icon={selectedInfo.icon as unknown as string}
          content={selectedInfo.fullDescription}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
