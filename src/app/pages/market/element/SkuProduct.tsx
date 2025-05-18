import { useEffect, useState } from "react";
import { SkuProductResponseDTO } from "@/types/SkuProductResponseDTO";
import { creditPayExchangeSku, querySkuProductListByActivityId } from "@/apis";
import { SaleProductEnum } from "@/types/sale_product";
import { useAccessStore } from "@/app/store/access";

// @ts-ignore
export function SkuProduct({ handleRefresh, activityId }) {
    const [SkuProductResponseDTOList, setSkuProductResponseDTOList] = useState<SkuProductResponseDTO[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // 控制弹窗显示

    const querySkuProductListByActivityIdHandle = async () => {
        const result = await querySkuProductListByActivityId(activityId);
        const { code, info, data }: { code: string; info: string; data: SkuProductResponseDTO[] } = await result.json();

        // 登录拦截
        if (code === SaleProductEnum.NeedLogin) {
            useAccessStore.getState().goToLogin();
        }

        if (code != "0000") {
            window.alert("查询产品列表，接口调用失败 code:" + code + " info:" + info);
            return;
        }

        setSkuProductResponseDTOList(data);
    };

    const creditPayExchangeSkuHandle = async (sku: number) => {
        const result = await creditPayExchangeSku(sku);
        const { code, info, data }: { code: string; info: string; data: boolean } = await result.json();

        // 登录拦截
        if (code === SaleProductEnum.NeedLogin) {
            useAccessStore.getState().goToLogin();
        }

        if (code != "0000") {
            window.alert("兑换抽奖次数失败 code:" + code + " info:" + info);
            return;
        }

        setShowSuccessModal(true); // 显示兑换成功弹窗
        const timer = setTimeout(() => {
            setShowSuccessModal(false); // 3秒后自动关闭弹窗
            handleRefresh(); // 刷新数据
        }, 3000);
    };

    useEffect(() => {
        querySkuProductListByActivityIdHandle();
    }, []);

    return (
        <>
            <div className="container mx-auto p-4" style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
                <div className="flex flex-wrap justify-center gap-4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
                    {SkuProductResponseDTOList.map((skuProduct, index) => (
                        <div key={index}>
                            <div
                                style={{
                                    maxWidth: '20rem',
                                    borderRadius: '0.5rem',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
                                    padding: '16px',
                                    background: 'linear-gradient(to right, #60A5FA, #34D399)',
                                    transform: 'scale(1)',
                                    transition: 'transform 300ms'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{ padding: '16px' }}>
                                    <div
                                        style={{
                                            fontWeight: 'bold',
                                            fontSize: '24px',
                                            marginBottom: '8px',
                                            textAlign: 'center',
                                            color: '#ffffff'
                                        }}>{skuProduct.activityCount.dayCount}次抽奖
                                    </div>
                                </div>
                                <div style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <button
                                            style={{
                                                backgroundColor: '#1D4ED8',
                                                color: '#ffffff',
                                                fontWeight: 'bold',
                                                padding: '4px 16px',
                                                borderRadius: '9999px',
                                                cursor: 'pointer'
                                            }}>{skuProduct.productAmount}￥
                                        </button>
                                        <button onClick={() => creditPayExchangeSkuHandle(skuProduct.sku)}
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    color: '#1D4ED8',
                                                    fontWeight: 'bold',
                                                    padding: '4px 16px',
                                                    borderRadius: '9999px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 200ms'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                        >
                                            <svg style={{ width: '20px', height: '20px', marginRight: '4px' }} fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 7M17 13l1.4 7M9 21h6"></path>
                                            </svg>
                                            兑换
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 兑换成功弹窗 */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '1000'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ marginBottom: '16px', color: '#10B981' }}>兑换成功！</h3>
                        <p>您的抽奖次数已到账，请查收~</p>
                    </div>
                </div>
            )}
        </>
    );
}