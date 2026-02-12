//src/components/DocxViewer.tsx
import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { Loader2, AlertCircle } from 'lucide-react';

interface DocxViewerProps {
  blob: Blob;
}

export default function DocxViewer({ blob }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendering, setRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Inyectar estilos en el head
  useEffect(() => {
    const styleId = 'docx-preview-styles';
    
    // Verificar si ya existe
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Calibri:wght@400;700&display=swap');

      .docx-wrapper {
        background: white !important;
        font-family: Calibri, Arial, sans-serif !important;
      }

      .docx-wrapper > section.docx {
        background: white !important;
        padding: 20px !important;
        box-shadow: none !important;
        margin: 0 auto !important;
        max-width: 100% !important;
      }

      .docx {
        background: white !important;
        max-width: 100% !important;
      }

      .docx * {
        font-family: inherit !important;
        max-width: 100% !important;
        word-wrap: break-word !important;
      }

      .docx table {
        border-collapse: collapse !important;
        width: 100% !important;
        margin: 10px 0 !important;
        display: block !important;
        overflow-x: auto !important;
      }

      .docx td,
      .docx th {
        border: 1px solid #000 !important;
        padding: 5px 8px !important;
        vertical-align: top !important;
        min-width: 50px !important;
      }

      /* Responsive: hacer que las tablas sean scrolleables en móvil */
      @media (max-width: 640px) {
        .docx table {
          font-size: 0.875rem !important;
        }
        
        .docx td,
        .docx th {
          padding: 4px 6px !important;
          font-size: 0.875rem !important;
        }

        .docx-wrapper > section.docx {
          padding: 10px !important;
        }
      }

      .docx td[style*="border: none"],
      .docx th[style*="border: none"] {
        border: none !important;
      }

      .docx hr {
        border: none !important;
        border-top: 1px solid #000 !important;
        margin: 10px 0 !important;
      }

      .docx svg[width="0"] {
        width: 100% !important;
        display: block !important;
      }

      .docx svg rect {
        width: 100% !important;
      }

      .docx p > span > div > svg {
        width: 100% !important;
        display: block !important;
      }

      .docx [style*="border-top"] {
        border-top-style: solid !important;
      }

      .docx [style*="border-bottom"] {
        border-bottom-style: solid !important;
      }

      .docx [style*="border-left"] {
        border-left-style: solid !important;
      }

      .docx [style*="border-right"] {
        border-right-style: solid !important;
      }

      .docx p[style*="border"] {
        border-style: solid !important;
      }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Estilos inyectados en el head');

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Asegurar que el componente está montado
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const render = async () => {
      // Esperar a que el ref esté disponible
      if (!containerRef.current) {
        console.log('⏳ Esperando a que el ref esté disponible...');
        return;
      }
      
      if (!blob) {
        console.error('❌ blob es null');
        setRenderError('Documento no disponible');
        setRendering(false);
        return;
      }

      try {
        setRendering(true);
        setRenderError(null);

        console.log('🎯 Iniciando renderizado...');
        console.log('📦 Container:', containerRef.current);
        console.log('📄 Blob:', blob.size, 'bytes', blob.type);

        // Limpiar contenedor
        containerRef.current.innerHTML = '';

        console.log('🔄 Llamando a renderAsync...');
        
        // Renderizar con todas las opciones para máxima fidelidad
        await renderAsync(blob, containerRef.current, undefined, {
          className: 'docx-wrapper',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false, // IMPORTANTE: Respetar las fuentes del documento
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          useBase64URL: true,
          experimental: true,
          breakPages: true, // Respetar saltos de página
          renderChanges: false,
        });
        
        console.log('✅ Renderizado exitoso!');
        console.log('📏 HTML generado:', containerRef.current.innerHTML.length, 'caracteres');
        
        // Verificar si realmente hay contenido
        if (containerRef.current.innerHTML.length < 100) {
          console.warn('⚠️ El HTML generado es muy corto');
          console.log('HTML:', containerRef.current.innerHTML);
        }

        // IMPORTANTE: Aplicar estilos directamente después del render
        setTimeout(() => {
          if (containerRef.current) {
            // Forzar estilos en SVGs
            const svgs = containerRef.current.querySelectorAll('svg[width="0"]');
            svgs.forEach((svg: any) => {
              svg.style.width = '100%';
              svg.style.display = 'block';
              const rect = svg.querySelector('rect');
              if (rect) {
                rect.style.width = '100%';
              }
            });

            // Forzar estilos en tablas
            const tables = containerRef.current.querySelectorAll('table');
            tables.forEach((table: any) => {
              table.style.borderCollapse = 'collapse';
              table.style.width = '100%';
              
              const cells = table.querySelectorAll('td, th');
              cells.forEach((cell: any) => {
                if (!cell.style.border || cell.style.border === 'none') {
                  cell.style.border = '1px solid #000';
                }
                cell.style.padding = '5px 8px';
              });
            });

            // Forzar fuentes - aplicar a TODOS los elementos
            const allElements = containerRef.current.querySelectorAll('*');
            allElements.forEach((el: any) => {
              // Preservar la fuente específica del elemento si existe
              const currentFont = el.style.fontFamily;
              if (!currentFont || currentFont === '') {
                // Si no tiene fuente definida, usar Calibri
                el.style.fontFamily = 'Calibri, Arial, sans-serif';
              }
              // Si tiene una fuente, asegurarse que esté disponible
              if (currentFont && !currentFont.includes('Calibri') && !currentFont.includes('Arial')) {
                el.style.fontFamily = currentFont + ', Calibri, Arial, sans-serif';
              }
            });

            console.log('🎨 Estilos aplicados manualmente (SVG, tablas, fuentes)');
          }
        }, 100);

        setRendering(false);
      } catch (err: any) {
        console.error('❌ Error renderizando:', err);
        console.error('Stack:', err?.stack);
        setRenderError(err?.message || 'Error al renderizar documento');
        setRendering(false);
      }
    };

    // Pequeño delay y verificar que el ref está disponible
    const timer = setTimeout(() => {
      if (containerRef.current) {
        render();
      } else {
        console.error('❌ Ref todavía null después de timeout');
        setRenderError('Error inicializando visor');
        setRendering(false);
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [blob, isMounted]);

  return (
    <>
      {/* Siempre renderizar el div para que el ref exista */}
      <div
        ref={containerRef}
        className="docx-container p-4 sm:p-6 lg:p-8"
        style={{
          minHeight: '60vh',
          maxWidth: '100%',
          margin: '0 auto',
          display: rendering ? 'none' : 'block',
          overflowX: 'auto',
        }}
      />

      {/* Mostrar loading encima si está renderizando */}
      {rendering && (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12" style={{ minHeight: '60vh' }}>
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#63bae9] animate-spin mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-[#686363]">Renderizando documento...</p>
        </div>
      )}

      {/* Mostrar error si hay */}
      {renderError && !rendering && (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12" style={{ minHeight: '60vh' }}>
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[#fcc238] mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-[#686363]">{renderError}</p>
        </div>
      )}
    </>
  );
}