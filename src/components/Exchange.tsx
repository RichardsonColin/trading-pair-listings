import React, { useEffect, useState } from 'react'
import Quote from './Quote'
import TradingList from './TradingList'
import '../css/exchange.css';

interface QuoteUI {
  id: string;
  exchange_id: string;
  symbol: string;
  updated_at: string;
}

interface ExchangeProps {
  id: string;
  name: string;
  description: string;
  url: string;
  image: string;
  origin: string;
  grade: string;
  volume_24_hour: string;
  updated_at: string;
  last_addition: string;
}

function Exchange(props: ExchangeProps) {
  const [quoteList, setQuoteList] = useState<QuoteUI[]>([])
  const [tradingPairsList, setTradingPairsList] = useState('')

  const fetchQuotes = async (exchangeId: string) => {
    const quotes = await fetch(`/exchanges/${exchangeId}/assets`)
      .then(res => res.json())
    quotes.map((pair: any) => pair.exchange_id = exchangeId)

    setQuoteList(quotes)
  }

  const fetchTradingPairs = async (exchangeId: string, quoteId: string) => {
    const tradingPairs = await fetch(`/exchanges/${exchangeId}/assets/${quoteId}/cryptocurrencies`)
      .then(res => res.json())
    // sort alphabetically by cryptocurrency symbol, map to strings (e.g. 'BINANCE:DCRUSDT'), format as single string
    const tradingPairsList = tradingPairs
      .sort((a: any, b: any) => a.asset_symbol.localeCompare(b.asset_symbol))
      .map((tradingPair: any, index: number) =>
        `${tradingPair.exchange_name.toUpperCase()}:${tradingPair.asset_symbol.toUpperCase()}${tradingPair.quote_symbol.toUpperCase()}`
      )
      .join(',')
    setTradingPairsList(tradingPairsList)
  }

  // TODO: export as helper
  const numberWithCommas = (x: any) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    fetchQuotes(props.id)
  }, [])

  const updated = new Date(props.last_addition).toDateString()
  return (
    <article className="exchange">
      <header>
        <div>
          {
            props.image !== null &&
            <a href={props.url} target="#">
              <img src={props.image} alt={`logo for ${props.name}`} />
            </a>
          }
          <h2>{props.name}</h2>
        </div>
        <div>
          <span>
            <strong>24Hr Volume</strong>: {parseFloat(props.volume_24_hour) > 0 ?
              `${numberWithCommas(parseFloat(props.volume_24_hour).toFixed(0))} BTC` :
              'Unknown'}
          </span>
          <span>
            <strong>Rating</strong>: {props.grade !== null ?
              `${props.grade}/10` :
              '-'}
          </span>
        </div>
      </header>
      <main>
        <div className="exchange-pairs-container">
          {quoteList.length > 0 &&
            quoteList.map((quote: QuoteUI) => (
              <Quote key={quote.id} {...quote} fetchTradingPairs={fetchTradingPairs} />
            ))
          }
        </div>
        {/* TODO: make into component */}
        <TradingList list={tradingPairsList} />
      </main>
      <footer>
        <span><strong>Origin</strong>: {props.origin || 'Unknown'}</span>
        <span><strong>Last Trading Pair Added</strong>: {updated}</span>
      </footer>
    </article>
  )
}

export default Exchange;
