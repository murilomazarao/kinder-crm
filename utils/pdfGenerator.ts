import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, Product } from '../types';

const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = (error) => reject(error);
    });
};

import { LOGO_URL } from '../constants';

export const generateQuotePDF = async (customer: Customer, products: Product[]) => {
    const doc = new jsPDF();

    // --- Header ---
    try {
        const logoData = await loadImage(LOGO_URL);
        doc.addImage(logoData, 'PNG', 14, 10, 50, 20); // Adjust dimensions as needed
    } catch (e) {
        console.error("Error loading logo:", e);
        // Fallback text if logo fails
        doc.setFontSize(22);
        doc.setTextColor(0, 102, 204);
        doc.text('Kinderplay', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Playgrounds', 14, 25);
    }

    // Date and Title
    const today = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`${today}`, 195, 20, { align: 'right' });
    doc.text('Orçamento Kinderplay', 195, 25, { align: 'right' });

    // --- Client Info ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(customer.name, 14, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(customer.company || '', 14, 50);
    doc.text('Detalhes do cliente e negociação.', 14, 55);

    doc.text(`Email: ${customer.email || '-'}`, 14, 65);
    doc.text(`Telefone: ${customer.phone || '-'}`, 100, 65);

    // --- Product Table ---
    const productCounts: Record<string, number> = {};
    (customer.products || []).forEach(id => {
        productCounts[id] = (productCounts[id] || 0) + 1;
    });
    const uniqueProductIds = Object.keys(productCounts);

    // Pre-load product images
    const productImages: Record<string, string> = {};
    await Promise.all(uniqueProductIds.map(async (id) => {
        const product = products.find(p => p.id === id);
        if (product && product.images && product.images.length > 0) {
            try {
                const imgData = await loadImage(product.images[0]);
                productImages[id] = imgData;
            } catch (e) {
                console.error(`Failed to load image for product ${product.name}`, e);
            }
        }
    }));

    const tableBody = uniqueProductIds.map(id => {
        const product = products.find(p => p.id === id);
        const qty = productCounts[id];
        if (!product) return [];
        return [
            '', // Image placeholder
            product.name,
            product.sku,
            qty,
            product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            (product.salePrice * qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        ];
    });

    autoTable(doc, {
        startY: 75,
        head: [['IMAGEM', 'PRODUTO', 'CÓDIGO', 'QUANTIDADE', 'VALOR UNITÁRIO', 'VALOR TOTAL']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [150, 150, 150], fontStyle: 'bold', lineColor: [230, 230, 230], lineWidth: 0.1 },
        bodyStyles: { textColor: [0, 51, 102], fontStyle: 'bold', valign: 'middle' }, // Blue text for body
        columnStyles: {
            0: { cellWidth: 20, minCellHeight: 20 }, // Image column
            1: { cellWidth: 'auto', textColor: [0, 51, 153] }, // Product Name blue
            3: { textColor: [0, 153, 51] }, // Qty green
            4: { textColor: [204, 0, 0] }, // Unit Price red
            5: { textColor: [0, 153, 51] } // Total Price green
        },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                const productId = uniqueProductIds[data.row.index];
                const imgData = productImages[productId];
                if (imgData) {
                    try {
                        doc.addImage(imgData, 'PNG', data.cell.x + 2, data.cell.y + 2, 16, 16);
                    } catch (e) {
                        // Ignore image error
                    }
                }
            }
        }
    });

    // --- Financial Summary ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Calculate totals
    const subtotal = uniqueProductIds.reduce((acc, id) => {
        const p = products.find(prod => prod.id === id);
        return acc + (p ? p.salePrice * productCounts[id] : 0);
    }, 0);

    const discountPercentage = customer.discount || 0;
    const discountValue = subtotal * (discountPercentage / 100);
    const freight = customer.freight || 0;
    const total = (subtotal - discountValue) + freight;

    // Draw Summary Box
    doc.setDrawColor(0, 51, 153);
    doc.setLineWidth(0.5);
    doc.rect(14, finalY, 182, 60); // Box

    doc.setFontSize(12);
    doc.setTextColor(0, 51, 153);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', 20, finalY + 10);

    doc.setFontSize(10);
    doc.setTextColor(0);

    // Subtotal
    doc.text('Subtotal:', 20, finalY + 25);
    doc.setTextColor(0, 153, 51); // Green
    doc.text(subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 190, finalY + 25, { align: 'right' });

    // Discount
    doc.setTextColor(0);
    doc.text(`Desconto (${discountPercentage}%):`, 20, finalY + 35);
    doc.setTextColor(204, 0, 0); // Red
    doc.text(`- ${discountValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 190, finalY + 35, { align: 'right' });

    // Freight
    doc.setTextColor(0);
    const freightLabel = customer.carrier
        ? `Frete (${customer.carrier}${customer.quoteNumber ? ` - Cotação: ${customer.quoteNumber}` : ''}):`
        : 'Frete:';
    doc.text(freightLabel, 20, finalY + 45);
    doc.setTextColor(0, 102, 204); // Blue
    doc.text(freight.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 190, finalY + 45, { align: 'right' });

    // Total
    doc.line(14, finalY + 50, 196, finalY + 50); // Separator line
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('VALOR TOTAL:', 20, finalY + 58);
    doc.setTextColor(0, 153, 51); // Green
    doc.setFontSize(14);
    doc.text(total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 190, finalY + 58, { align: 'right' });

    // --- Validity and Disclaimer ---
    const disclaimerY = finalY + 70;
    doc.setFontSize(9);
    doc.setTextColor(100);

    // Calculate validity date
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + 30);
    const validityStr = validityDate.toLocaleDateString('pt-BR');

    doc.text(`* Pagamentos à vista via PIX ou BOLETO será concedido um desconto de ${discountPercentage}%`, 14, disclaimerY);
    doc.text(`* Esse orçamento tem validade de 30 dias (${validityStr})`, 14, disclaimerY + 6);

    // Save
    doc.save(`Orcamento_${customer.name.replace(/\s+/g, '_')}.pdf`);
};
