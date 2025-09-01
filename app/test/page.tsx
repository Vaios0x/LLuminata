export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Test de Tailwind CSS
        </h1>
        <p className="text-gray-600 mb-4">
          Si ves este texto con estilos, Tailwind CSS está funcionando correctamente.
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Botón de Prueba
        </button>
      </div>
    </div>
  )
}
