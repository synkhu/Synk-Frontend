"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import Modal from "@/components/Modal";

const API_URL = "https://api.synk.hu";

type TicketType = {
  id: string;
  name: string;
  price: number;
  saleStartTime?: string;
  saleEndTime?: string;
  maxSaleCount?: number;
  remainingCount?: number;
};

type EventDetails = {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  thumbnailUrl?: string;
  totalCapacity?: number;
  ticketMaxScanCount?: number;
  venueId?: string;
  venueName?: string;
  venueAddress?: string;
  artistName?: string;
  artistId?: string;
  ticketTypes?: TicketType[];
  imageUrls?: string[];
};

type ApiEventDetails = EventDetails & {
  venue?: {
    id?: string;
    name?: string;
    address?: string;
  };
  artist?: {
    id?: string;
    name?: string;
  };
  venueid?: string;
  venuename?: string;
  venue_address?: string;
  artistid?: string;
  artistname?: string;
};

type BillingAddress = {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  stateOrProvince?: string | null;
  postalCode: string;
  country: string;
  phoneNumber?: string | null;
  isDefault?: boolean;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

type PurchasePayload = {
  eventId: string;
  items: Array<{ ticketTypeId: string; quantity: number }>;
  billingAddressId: string | null;
  billingInfo: Record<string, unknown>;
  saveBillingAddress: boolean;
};

const mapEventDetails = (data: ApiEventDetails): EventDetails => ({
  ...data,
  venueId: data.venueId ?? data.venueid ?? data.venue?.id ?? undefined,
  venueName: data.venueName ?? data.venuename ?? data.venue?.name ?? undefined,
  venueAddress: data.venueAddress ?? data.venue_address ?? data.venue?.address ?? undefined,
  artistName: data.artistName ?? data.artistname ?? data.artist?.name ?? undefined,
  artistId: data.artistId ?? data.artistid ?? data.artist?.id ?? undefined,
});

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [eventId, setEventId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<BillingAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  
  const [billingInfo, setBillingInfo] = useState({ 
    fullName: "", 
    addressLine1: "", 
    addressLine2: "", 
    city: "", 
    stateOrProvince: "", 
    postalCode: "", 
    country: "", 
    phoneNumber: "" 
  });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", expiry: "", cvc: "" });
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAddresses() {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      
      setLoadingAddresses(true);
      try {
        const { data } = await axios.get<BillingAddress[]>(
          `${API_URL}/billing-addresses`,
          {
          headers: { Authorization: `Bearer ${token}` }
          },
        );
        setSavedAddresses(data);
        if (data.length > 0) {
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr.id);
          setIsAddingNewAddress(false);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch addresses", err);
        setIsAddingNewAddress(true);
      } finally {
        setLoadingAddresses(false);
      }
    }

    if (isPurchaseModalOpen) {
      fetchAddresses();
    }
  }, [isPurchaseModalOpen]);

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`${API_URL}/billing-addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedAddresses(prev => prev.filter(a => a.id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
    } catch {
      alert("Failed to delete address");
    }
  };

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!eventId) return;
    async function fetchEventDetails() {
      try {
        const res = await axios.get<ApiEventDetails>(`${API_URL}/events/${eventId}`);
        setEvent(mapEventDetails(res.data));
        setLoading(false);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setError(apiErr.response?.data?.message || "Failed to load event details");
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [eventId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const handleCheckout = () => {
    const selectedItems = Object.entries(ticketQuantities)
      .filter(([, qty]) => qty > 0);

    if (selectedItems.length === 0) return alert("Select at least one ticket");
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to purchase tickets");
      return;
    }
    
    setIsPurchaseModalOpen(true);
  };

  const executePurchase = async () => {
    if (!eventId) {
      alert("Missing event information. Please refresh and try again.");
      return;
    }

    const selectedItems = Object.entries(ticketQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ticketTypeId: id, quantity: qty }));

    const token = localStorage.getItem("authToken");
    
    let finalBillingAddressId = selectedAddressId;

    if (isAddingNewAddress) {
      // Validate billing info
      if (!billingInfo.fullName || !billingInfo.addressLine1 || !billingInfo.city || !billingInfo.postalCode || !billingInfo.country) {
        return alert("Please fill in all required billing fields");
      }
      
      // Validate payment info
      if (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvc) {
        return alert("Please fill in all payment information");
      }

      if (saveAddress) {
        try {
          // Save the new address first
          const { data: newAddress } = await axios.post<BillingAddress>(
            `${API_URL}/billing-addresses`,
            {
            ...billingInfo,
            addressLine2: billingInfo.addressLine2 || null,
            stateOrProvince: billingInfo.stateOrProvince || null,
            phoneNumber: billingInfo.phoneNumber || null,
            isDefault: savedAddresses.length === 0 // Make default if it's the first one
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          
          finalBillingAddressId = newAddress.id;
          // Update local state with new address
          setSavedAddresses(prev => [...prev, newAddress]);
          setSelectedAddressId(newAddress.id);
          setIsAddingNewAddress(false);
        } catch (err: unknown) {
          const apiErr = err as ApiError;
          console.error("Failed to save billing address", err);
          return alert(
            "Failed to save billing address: " +
              (apiErr.response?.data?.message || apiErr.message),
          );
        }
      } else {
        finalBillingAddressId = null;
      }
    } else {
      if (!finalBillingAddressId) return alert("Please select a billing address");
      if (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvc) {
        return alert("Please fill in all payment information");
      }
    }

    let billingInfoPayload = {};
    if (isAddingNewAddress) {
       billingInfoPayload = {
          fullName: billingInfo.fullName,
          addressLine1: billingInfo.addressLine1,
          addressLine2: billingInfo.addressLine2 || null,
          city: billingInfo.city,
          stateOrProvince: billingInfo.stateOrProvince || null,
          postalCode: billingInfo.postalCode,
          country: billingInfo.country,
          phoneNumber: billingInfo.phoneNumber || null
       };
    } else if (finalBillingAddressId) {
      const selectedAddr = savedAddresses.find((a) => a.id === finalBillingAddressId);
      if (selectedAddr) {
        billingInfoPayload = {
          fullName: selectedAddr.fullName,
          addressLine1: selectedAddr.addressLine1,
          addressLine2: selectedAddr.addressLine2,
          city: selectedAddr.city,
          stateOrProvince: selectedAddr.stateOrProvince,
          postalCode: selectedAddr.postalCode,
          country: selectedAddr.country,
          phoneNumber: selectedAddr.phoneNumber
        };
      }
    }

    const payload: PurchasePayload = {
      eventId, 
      items: selectedItems,
      billingAddressId: finalBillingAddressId,
      billingInfo: billingInfoPayload,
      saveBillingAddress: saveAddress
    }; 
    
    console.log("Executing purchase with payload:", JSON.stringify(payload, null, 2));

    try {
      const { data } = await axios.post(`${API_URL}/orders/purchase`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setSuccessOrderId(data.orderId);
      setTicketQuantities({});
      setIsPurchaseModalOpen(false);
      // Refresh event data
      const res = await axios.get(`${API_URL}/events/${eventId}`);
      setEvent(mapEventDetails(res.data));
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      console.error(err);
      if (apiErr.message === "Network Error") {
         alert("Network Error: Unable to reach the server. Please check your internet connection.");
       } else {
         alert(
           "Purchase failed: " +
             (apiErr.response?.data?.message || apiErr.message || "Unknown error"),
         );
       }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4 bg-red-500/5 border border-red-500/20 p-8 rounded-3xl text-red-400">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{error || "Event not found"}</p>
        <button onClick={() => router.push("/")} className="w-full py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200">Back Home</button>
      </div>
    </div>
  );

  const imageUrls = event.imageUrls || [event.thumbnailUrl].filter(Boolean);

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-start">
        {/* Left: Event Main Content */}
        <div className="lg:col-span-3 space-y-10">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 aspect-video group">
            {imageUrls.length > 0 ? (
              <>
                <Image
                  src={(imageUrls[currentImageIndex] || imageUrls[0])!}
                  alt={event.name}
                  fill
                  unoptimized
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                {imageUrls.length > 1 && (
                  <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
                    {imageUrls.map((_, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "w-8 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black" />
            )}
          </div>

          <div className="space-y-6">
            <header className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest rounded-full">Music Event</span>
                {event.totalCapacity && <span className="px-4 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest rounded-full">{event.totalCapacity} Capacity</span>}
              </div>
              <h1 className="text-2xl md:text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">{event.name}</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Date & Time</p>
                <p className="text-sm md:text-lg text-white font-semibold">{formatDate(event.startTime)}</p>
                <p className="text-sm text-gray-500">Ends {formatDate(event.endTime)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Location</p>
                {event.venueId ? (
                  <Link
                    href={`/venues/${event.venueId}`}
                    className="flex items-center gap-1.5 text-sm md:text-lg text-white font-semibold hover:text-purple-400 transition-colors group w-fit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-400 shrink-0">
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <span className="underline-offset-2 group-hover:underline">{event.venueName || "Venue TBD"}</span>
                  </Link>
                ) : (
                  <p className="text-sm md:text-lg text-white font-semibold">{event.venueName || "Venue TBD"}</p>
                )}
                {event.venueAddress && <p className="text-sm text-gray-500">{event.venueAddress}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Artist</p>
                {event.artistId ? (
                  <Link
                    href={`/artists/${event.artistId}`}
                    className="flex items-center gap-1.5 text-sm md:text-lg text-white font-semibold hover:text-purple-400 transition-colors group w-fit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-400 shrink-0">
                      <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
                    </svg>
                    <span className="underline-offset-2 group-hover:underline">{event.artistName}</span>
                  </Link>
                ) : event.artistName ? (
                  <p className="flex items-center gap-1.5 text-sm md:text-lg text-white font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-400 shrink-0">
                      <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
                    </svg>
                    {event.artistName}
                  </p>
                ) : (
                  <p className="text-sm md:text-lg text-gray-500 font-semibold">TBA</p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 md:pt-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">About Event</h2>
              <p className="text-gray-400 leading-relaxed text-sm md:text-lg whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Ticket Sidebar */}
        <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-8">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-4 md:p-10 space-y-4 md:space-y-8 backdrop-blur-xl">
            <header className="text-center space-y-2">
              <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">Get Your Tickets</h2>
              <p className="text-gray-500 text-sm">Secure your spot at this event</p>
            </header>

            <div className="space-y-4">
              {event.ticketTypes?.map((ticket) => (
                <div 
                  key={ticket.id}
                  className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 ${
                    ticketQuantities[ticket.id] > 0 
                      ? "bg-purple-500/10 border-purple-500/50" 
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="p-3 md:p-6 space-y-4">
                    <div className="flex flex-col gap-2 items-center md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-sm md:text-lg text-center md:text-left">{ticket.name}</h3>
                        <p className="text-purple-400 font-bold">{ticket.price.toLocaleString()} HUF</p>
                      </div>
                      <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-1 border border-white/5">
                        <button 
                          onClick={() => setTicketQuantities(p => ({ ...p, [ticket.id]: Math.max(0, (p[ticket.id] || 0) - 1) }))}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                        </button>
                        <span className="text-white font-bold w-6 text-center">{ticketQuantities[ticket.id] || 0}</span>
                        <button 
                          onClick={() => setTicketQuantities(p => {
                            const currentTotal = Object.values(p).reduce((a, b) => a + b, 0);
                            if (currentTotal >= 10) return p;
                            return { ...p, [ticket.id]: (p[ticket.id] || 0) + 1 };
                          })}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {Object.values(ticketQuantities).some(v => v > 0) ? (
              <div className="space-y-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center px-2">
                  <span className="text-gray-400 font-medium">Total Price</span>
                  <span className="text-2xl font-bold text-white">
                    {event.ticketTypes?.reduce((acc, t) => acc + (t.price * (ticketQuantities[t.id] || 0)), 0).toLocaleString()} HUF
                  </span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full py-5 bg-white hover:bg-gray-200 text-black font-extrabold rounded-[2rem] transition-all active:scale-[0.98] shadow-2xl shadow-white/5"
                >
                  Confirm Purchase
                </button>
              </div>
            ) : (
              <div className="text-center py-2 md:py-4">
                <p className="text-gray-600 text-sm italic">Select ticket quantity to proceed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)} 
        title="Complete Purchase"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Billing Address</h3>
              {!isAddingNewAddress && savedAddresses.length > 0 && (
                <button 
                  onClick={() => {
                    setIsAddingNewAddress(true);
                    setSelectedAddressId(null);
                  }}
                  className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                >
                  + Add New Address
                </button>
              )}
              {isAddingNewAddress && savedAddresses.length > 0 && (
                <button 
                  onClick={() => setIsAddingNewAddress(false)}
                  className="text-sm text-gray-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            {loadingAddresses ? (
              <div className="text-center py-4 text-gray-500">Loading addresses...</div>
            ) : !isAddingNewAddress && savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id 
                        ? "bg-purple-500/10 border-purple-500" 
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{addr.fullName}</p>
                        <p className="text-sm text-gray-400">{addr.addressLine1}</p>
                        <p className="text-sm text-gray-400">
                          {addr.city}, {addr.postalCode}
                        </p>
                        <p className="text-sm text-gray-500">{addr.country}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Delete address"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-400">Full Name</label>
                  <input 
                    type="text" 
                    value={billingInfo.fullName}
                    onChange={(e) => setBillingInfo(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-400">Address Line 1</label>
                  <input 
                    type="text" 
                    value={billingInfo.addressLine1}
                    onChange={(e) => setBillingInfo(p => ({ ...p, addressLine1: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="123 Event St"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-400">Address Line 2 (Optional)</label>
                  <input 
                    type="text" 
                    value={billingInfo.addressLine2}
                    onChange={(e) => setBillingInfo(p => ({ ...p, addressLine2: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="Apt, Suite, etc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">City</label>
                  <input 
                    type="text" 
                    value={billingInfo.city}
                    onChange={(e) => setBillingInfo(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">State / Province</label>
                  <input 
                    type="text" 
                    value={billingInfo.stateOrProvince}
                    onChange={(e) => setBillingInfo(p => ({ ...p, stateOrProvince: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">ZIP / Postal Code</label>
                  <input 
                    type="text" 
                    value={billingInfo.postalCode}
                    onChange={(e) => setBillingInfo(p => ({ ...p, postalCode: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Country</label>
                  <input 
                    type="text" 
                    value={billingInfo.country}
                    onChange={(e) => setBillingInfo(p => ({ ...p, country: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="Country"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-400">Phone Number (Optional)</label>
                  <input 
                    type="text" 
                    value={billingInfo.phoneNumber}
                    onChange={(e) => setBillingInfo(p => ({ ...p, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-white/5 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="saveAddress" className="text-sm font-medium text-gray-400 select-none cursor-pointer">
                    Save address for future purchases?
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-xl font-bold text-white">Payment Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Card Number</label>
                <input 
                  type="text" 
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo(p => ({ ...p, cardNumber: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Expiry Date</label>
                  <input 
                    type="text" 
                    value={paymentInfo.expiry}
                    onChange={(e) => setPaymentInfo(p => ({ ...p, expiry: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">CVC</label>
                  <input 
                    type="text" 
                    value={paymentInfo.cvc}
                    onChange={(e) => setPaymentInfo(p => ({ ...p, cvc: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={executePurchase}
              disabled={!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvc}
              className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg ${
                !paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvc
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20"
              }`}
            >
              {isAddingNewAddress ? "Save Address & Pay" : "Confirm & Pay"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!successOrderId}
        onClose={() => setSuccessOrderId(null)}
        title="Purchase Successful!"
      >
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Tickets Purchased!</h3>
            <p className="text-gray-400">
              Your order has been confirmed.
              <br />
              <span className="text-sm font-mono bg-white/5 px-2 py-1 rounded mt-2 inline-block">Order ID: {successOrderId}</span>
            </p>
          </div>
          <button
            onClick={() => setSuccessOrderId(null)}
            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
}
