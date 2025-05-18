import styles from './sale.module.scss';
import { createPayOrder, queryProductList } from "@/apis";
import { useEffect, useState } from "react";
import { SaleProduct, SaleProductEnum } from "@/types/sale_product";
import { useAccessStore } from "@/app/store/access";
import { useNavigate } from "react-router-dom";

export function Sale() {
    const [products, setProducts] = useState<SaleProduct[]>([]);
    const navigate = useNavigate();

    const queryProductListHandle = async () => {
        const res = await queryProductList();
        const { data, code } = await res.json();
        if (code === SaleProductEnum.NeedLogin) {
            useAccessStore.getState().goToLogin();
        }
        setProducts(data);
    };

    const payOrder = async (productId: number) => {
        const res = await createPayOrder(productId);
        const { data, code } = await res.json();

        if (code === SaleProductEnum.NeedLogin) {
            useAccessStore.getState().goToLogin();
            return;
        }

        if (code === SaleProductEnum.SUCCESS) {
            // 支付宝返回的是一个 HTML form，直接渲染并自动提交
            const div = document.createElement("div");
            div.innerHTML = data; // data 是支付宝返回的 form HTML
            document.body.appendChild(div);
            const form = div.querySelector("form");
            if (form) form.submit();
        }
    };

    useEffect(() => {
        queryProductListHandle();
    }, []);

    return (
        <div className={styles["sale"]}>
            {products?.map((product) => (
                <div key={product.productId} className={styles["product"]}>
                    <div className={styles["product-name"]}>
                        {product.productName}
                    </div>
                    <div className={styles["product-token"]}>
                        {product.quota}<span className={styles["product-token-subscript"]}>(条)</span>
                    </div>
                    <div className={styles["product-price"]}>
                        <span style={{ color: '#af0000', fontSize: "20px" }}>￥{product.price.toFixed(2)}</span>
                    </div>
                    <div className={styles["product-buy"]} onClick={() => payOrder(product.productId)}>
                        立即购买
                    </div>
                    <div className={styles["product-desc"]}>
                        <span>{product.productDesc}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}