'use client';

import React, { useState } from 'react';
import PanelHeader from './PanelHeader';

interface Order {
  id: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  symbol: string;
  price: number;
  orderType: string;
  status: 'FILLED' | 'WORKING' | 'PENDING';
  time: string;
}

export default function TradeTicketPanel() {
  const [security, setSecurity] = useState('SPX Index');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState(100);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP' | 'STOP-LIMIT' | 'MOC'>('MARKET');
  const [price, setPrice] = useState('5428.75');
  const [tif, setTif] = useState<'DAY' | 'GTC' | 'IOC' | 'FOK'>('DAY');
  const [algo, setAlgo] = useState('DIRECT');
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', side: 'BUY', quantity: 200, symbol: 'SPY', price: 542.50, orderType: 'LMT', status: 'FILLED', time: '14:28' },
    { id: '2', side: 'SELL', quantity: 100, symbol: 'NVDA', price: 0, orderType: 'MKT', status: 'FILLED', time: '14:15' },
    { id: '3', side: 'BUY', quantity: 300, symbol: 'QQQ', price: 460.00, orderType: 'LMT', status: 'WORKING', time: '14:02' },
    { id: '4', side: 'SELL', quantity: 50, symbol: 'AAPL', price: 190.00, orderType: 'STP', status: 'PENDING', time: '13:45' },
  ]);
  const [sendButtonFlash, setSendButtonFlash] = useState(false);

  const handleSendOrder = () => {
    setSendButtonFlash(true);

    const newOrder: Order = {
      id: Date.now().toString(),
      side,
      quantity,
      symbol: security.split(' ')[0],
      price: orderType === 'MARKET' ? 0 : parseFloat(price),
      orderType: orderType === 'MOC' ? 'MOC' : orderType === 'MARKET' ? 'MKT' : orderType.slice(0, 3),
      status: 'WORKING',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    setOrders([newOrder, ...orders]);

    setTimeout(() => {
      setSendButtonFlash(false);
      setOrders((prev) =>
        prev.map((o) => (o.id === newOrder.id ? { ...o, status: 'FILLED' } : o))
      );
    }, 2000);
  };

  const handleClear = () => {
    setSecurity('SPX Index');
    setSide('BUY');
    setQuantity(100);
    setOrderType('MARKET');
    setPrice('5428.75');
    setTif('DAY');
    setAlgo('DIRECT');
  };

  const getOrderPreview = () => {
    const priceDisplay = orderType === 'MARKET' ? 'MARKET' : `@ ${price}`;
    return `${side} ${quantity} ${security.split(' ')[0]} ${priceDisplay} | ${tif} | ${algo}`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'FILLED') return '#4af6c3';
    if (status === 'WORKING') return '#ffa028';
    return '#888888';
  };

  return (
    <div style={{
      backgroundColor: '#000000',
      color: '#e8e8e8',
      fontFamily: 'monospace',
      fontSize: '9px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #333333',
    }}>
      <PanelHeader title="EMSX" subtitle="Execution Management" rightLabel="TRADE" />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Security Lookup Section */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222222' }}>
          <div style={{ marginBottom: '6px', fontSize: '8px', color: '#888888' }}>SECURITY</div>
          <input
            type="text"
            value={security}
            onChange={(e) => setSecurity(e.target.value)}
            placeholder="Enter security"
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: '#111111',
              color: '#e8e8e8',
              border: '1px solid #333333',
              fontFamily: 'monospace',
              fontSize: '9px',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: '4px', fontSize: '8px', color: '#888888' }}>
            {security}
          </div>
        </div>

        {/* Side Toggle */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222222' }}>
          <div style={{ marginBottom: '6px', fontSize: '8px', color: '#888888' }}>SIDE</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSide('BUY')}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: side === 'BUY' ? '#22aa44' : '#1a1a1a',
                color: side === 'BUY' ? '#000000' : '#666666',
                border: '1px solid ' + (side === 'BUY' ? '#22aa44' : '#333333'),
                fontFamily: 'monospace',
                fontSize: '9px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              BUY
            </button>
            <button
              onClick={() => setSide('SELL')}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: side === 'SELL' ? '#ff433d' : '#1a1a1a',
                color: side === 'SELL' ? '#000000' : '#666666',
                border: '1px solid ' + (side === 'SELL' ? '#ff433d' : '#333333'),
                fontFamily: 'monospace',
                fontSize: '9px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222222' }}>
          <div style={{ marginBottom: '6px', fontSize: '8px', color: '#888888' }}>QUANTITY</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setQuantity(Math.max(0, quantity - 100))}
              style={{
                width: '32px',
                padding: '6px',
                backgroundColor: '#1a1a1a',
                color: '#ffa028',
                border: '1px solid #333333',
                fontFamily: 'monospace',
                fontSize: '9px',
                cursor: 'pointer',
              }}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: '#111111',
                color: '#e8e8e8',
                border: '1px solid #333333',
                fontFamily: 'monospace',
                fontSize: '9px',
                textAlign: 'right',
              }}
            />
            <button
              onClick={() => setQuantity(quantity + 100)}
              style={{
                width: '32px',
                padding: '6px',
                backgroundColor: '#1a1a1a',
                color: '#ffa028',
                border: '1px solid #333333',
                fontFamily: 'monospace',
                fontSize: '9px',
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Order Type */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222222' }}>
          <div style={{ marginBottom: '6px', fontSize: '8px', color: '#888888' }}>ORDER TYPE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['MARKET', 'LIMIT', 'STOP', 'STOP-LIMIT', 'MOC'].map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type as any)}
                style={{
                  padding: '6px',
                  backgroundColor: orderType === type ? '#0068ff' : '#1a1a1a',
                  color: orderType === type ? '#ffffff' : '#666666',
                  border: '1px solid ' + (orderType === type ? '#0068ff' : '#333333'),
                  fontFamily: 'monospace',
                  fontSize: '8px',
                  fontWeight: orderType === type ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Price Field (conditional) */}
        {(orderType === 'LIMIT' || orderType === 'STOP' || orderType === 'STOP-LIMIT') && (
          <div style={{ padding: '12px', borderBottom: '1px solid #222222' }}>
            <div style={{ marginBottom: '6px', fontSize: '8px', color: '#888888' }}>PRICE</div>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                backgroundColor: '#111111',
                color: '#4af6c3',
                border: '1px solid #333333',
                fontFamily: 'monospace',
                fontSize: '9px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Time in Force */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222222' }}>
          <div style={{ marginBottom: '6px', fontSize: '8px', color: '#888888' }}>TIME IN FORCE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
            {['DAY', 'GTC', 'IOC', 'FOK'].map((t) => (
              <button
                key={t}
                onClick={() => setTif(t as any)}
                style={{
                  padding: '6px',
                  backgroundColor: tif === t ? '#0068ff' : '#1a1a1a',
                  color: tif === t ? '#ffffff' : '#666666',
                  border: '1px solid ' + (tif === t ? '#0068ff' : '#333333'),
                  fontFamily: 'monospace',
                  fontSize: '8px',
                  fontWeight: tif === t ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Broker/Algo Selector */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222222' }}>
          <div style={{ marginBottom: '6px', fontSize: '8px', color: '#888888' }}>BROKER / ALGO</div>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: '#111111',
              color: '#e8e8e8',
              border: '1px solid #333333',
              fontFamily: 'monospace',
              fontSize: '9px',
              cursor: 'pointer',
            }}
          >
            {['DIRECT', 'VWAP', 'TWAP', 'IS', 'BEST EX'].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Order Preview */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222222', backgroundColor: '#0a0a0a' }}>
          <div style={{ fontSize: '8px', color: '#888888', marginBottom: '4px' }}>ORDER PREVIEW</div>
          <div style={{ fontSize: '10px', color: '#ffa028', fontWeight: 'bold' }}>
            {getOrderPreview()}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222222', display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSendOrder}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: sendButtonFlash ? '#ffb847' : '#ffa028',
              color: '#000000',
              border: '1px solid #ffa028',
              fontFamily: 'monospace',
              fontSize: '9px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
            }}
          >
            SEND ORDER
          </button>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#1a1a1a',
              color: '#555555',
              border: '1px solid #333333',
              fontFamily: 'monospace',
              fontSize: '9px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            CLEAR
          </button>
        </div>

        {/* Recent Orders */}
        <div style={{ flex: 1, overflow: 'auto', borderBottom: '1px solid #222222' }}>
          <div style={{ padding: '12px', fontSize: '8px', color: '#888888', fontWeight: 'bold' }}>
            RECENT ORDERS
          </div>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #1a1a1a',
                fontSize: '9px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ color: order.side === 'BUY' ? '#22aa44' : '#ff433d', fontWeight: 'bold' }}>
                  {order.side}
                </span>
                {' '}
                <span style={{ color: '#e8e8e8' }}>
                  {order.quantity} {order.symbol}
                </span>
                {' '}
                <span style={{ color: '#888888' }}>
                  {order.orderType === 'MKT' ? '@ MKT' : `@ ${order.price}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: getStatusColor(order.status), fontWeight: 'bold' }}>
                  {order.status}
                </span>
                <span style={{ color: '#666666' }}>{order.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
