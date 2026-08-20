import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0c0c14] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-bounce">🏆</div>
        <h1 className="text-5xl font-black text-white mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
          404
        </h1>
        <p className="text-xl font-700 text-amber-400 mb-2" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
          Page Not Found
        </p>
        <p className="text-gray-400 mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          The moment you're looking for seems to have gone off-schedule.
        </p>
        <button
          onClick={() => navigate('/')}
          className="chunky-btn bg-amber-400 text-amber-900 px-8 py-4 rounded-2xl text-lg"
          style={{ borderColor: '#92400e', boxShadow: '5px 5px 0 #92400e' }}
        >
          Return to Base 🏠
        </button>
      </div>
    </div>
  );
}
