-- Run this SQL in your Supabase SQL Editor to initialize the tables for Auctions

-- Auctions Table
CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    level INT NOT NULL DEFAUlT 1,
    owner_id TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    start_price INT NOT NULL,
    buy_now_price INT,
    highest_bid INT,
    highest_bidder_id TEXT,
    highest_bidder_email TEXT,
    winner_id TEXT,
    winner_email TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bids Table
CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    bidder_id TEXT NOT NULL,
    bidder_email TEXT NOT NULL,
    amount INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Turn off RLS for these tables so the preview can write directly
ALTER TABLE public.auctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids DISABLE ROW LEVEL SECURITY;

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
